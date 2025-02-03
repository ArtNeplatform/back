import nodeSchedule from 'node-schedule';
import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import sequelize from '../sequelize.js';
import Auction from './AuctionModel.js';
import AuctionBid from './AuctionbidModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import ArtworkImage from '../Artwork/ArtworkImageModel.js';
import FavoriteAuction from '../Favorite/FavoriteAuction.js';
import Author from '../Author/AuthorModel.js';
import { broadcastToClients } from '../../../config/webSocket.js';
import { convertToKST, getCurrentKST } from '../../../config/dateFormatter.js';

// 정렬 함수들
const sortByPopular = (auctionData) => auctionData.sort((a, b) => b.favoritesCount - a.favoritesCount);
const sortByLatest = (auctionData) => auctionData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
const sortByTitle = (auctionData) => auctionData.sort((a, b) => (a.artwork?.title || '').localeCompare(b.artwork?.title || '', 'ko', { sensitivity: 'base' }));

// 경매 종료 스케줄링
export const scheduleAuctionEnd = (auction) => {
  if (!auction?.end_time) return;

  const endTime = convertToKST(auction.end_time).toJSDate();
  nodeSchedule.scheduleJob(endTime, async () => {
    try {
      const currentAuction = await Auction.findByPk(auction.id);
      if (currentAuction && !currentAuction.final_price) {
        currentAuction.final_price = currentAuction.current_price;
        await currentAuction.save();

        broadcastToClients(status.SUCCESS, {
          auction_id: currentAuction.id,
          status: '경매 완료',
          final_price: currentAuction.final_price,
          end_time: currentAuction.end_time,
        });
      }
    } catch (error) {
      console.error(`경매 종료 처리 중 에러 발생 (경매 ID ${auction.id}):`, error);
    }
  });

  console.log(`경매 ID ${auction.id}에 대한 스케줄링이 설정되었습니다.`);
};

// 경매 가능 작품 조회
export const getAvailableArtworks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const author = await Author.findOne({ where: { user_id: userId } });
    if (!author) {
      return sendResponse(res, status.AUTHOR_NOT_FOUND);
    }

    const artworks = await Artwork.findAll({
      where: { author_id: author.id },
      attributes: ['id', 'title', 'thumbnail_image_url']
    });

    if (!artworks.length) {
      return sendResponse(res, status.SUCCESS, []);
    }

    const ongoingAuctions = await Auction.findAll({
      where: { artwork_id: artworks.map(artwork => artwork.id) },
      attributes: ['artwork_id', 'end_time', 'final_price']
    });

    // 진행 중인 경매가 있는 작품 제외
    const availableArtworks = artworks.filter(artwork => {
      const auction = ongoingAuctions.find(a => a.artwork_id === artwork.id);
      return !(auction);
    });
    const availableArtworksList = availableArtworks.map(artwork => {
      return {
        artwork_id: artwork.id,
        title: artwork.title,
        thumbnail_image_url: artwork.thumbnail_image_url
      };
    });

    return sendResponse(res, status.SUCCESS, availableArtworksList);
  } catch (error) {
    console.error('getAvailableArtworks 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};

// 경매 등록
export const registerAuction = async (req, res) => {
  try {
    const { artwork_id, start_price, end_time } = req.body;

    const artwork = await Artwork.findOne({ where: { id: artwork_id } });
    if (!artwork) return sendResponse(res, status.ARTWORK_NOT_FOUND);

    const currentTime = getCurrentKST();
    const inputEndTime = convertToKST(end_time);

    if (inputEndTime <= currentTime) return sendResponse(res, status.INVALID_END_TIME);

    const ongoingAuction = await Auction.findOne({
      where: {artwork_id}
    });

    if (ongoingAuction) return sendResponse(res, status.AUCTION_ALREADY_ONGOING);

    const newAuction = await Auction.create({
      artwork_id,
      start_price,
      current_price: start_price,
      start_time: currentTime.toISO(),
      end_time: inputEndTime.toISO(),
    });

    scheduleAuctionEnd(newAuction);

    const auctionData = newAuction.get({ plain: true });
    delete auctionData.updatedAt;
    delete auctionData.createdAt;

    return sendResponse(res, status.SUCCESS, {
      ...auctionData,
      start_time: currentTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      end_time: inputEndTime.toFormat('yyyy-MM-dd HH:mm:ss'),
    });
  } catch (error) {
    console.error('registerAuction 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};

// 경매 입찰
export const bidAuction = async (req, res) => {
  try {
    const { auctionId, bidPrice } = req.body;
    const userId = Number(req.user.userId); 

    const auction = await Auction.findByPk(auctionId, {
      include: {
        model: Artwork,
        as: 'artwork',
        include: {
          model: Author,
          as: 'author'
        }
      }
    });

    if (!auction) return sendResponse(res, status.AUCTION_NOT_FOUND);
    if (Number(auction.artwork.author.user_id) === userId) return sendResponse(res, status.CANNOT_BID_OWN_AUCTION);
    if (bidPrice <= auction.start_price) return sendResponse(res, status.BID_LOWER_THAN_START_PRICE);
    if (bidPrice <= auction.current_price) return sendResponse(res, status.BID_LOWER_THAN_CURRENT_PRICE);

    // 현재 입찰자가 있으면 상태를 'PARTICIPATE(응찰)'로 변경
    const currentBidder = await AuctionBid.findOne({ where: { auction_id: auctionId, status: 'BID' } });
    if (currentBidder) await currentBidder.update({ status: 'PARTICIPATE' });

    const newBid = await AuctionBid.create({
      auction_id: auctionId,
      user_id: userId,
      bid_price: bidPrice,
      bid_date: getCurrentKST(),
      status: 'BID'
    });

    auction.current_price = bidPrice;
    await auction.save();

    const bidData = newBid.get({ plain: true });
    delete bidData.created_at;
    delete bidData.updated_at;

    broadcastToClients(status.SUCCESS, bidData);
    return sendResponse(res, status.SUCCESS, bidData);
  } catch (error) {
    console.error('bidAuction 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};

// 경매 리스트 조회
export const getAuctionList = async (req, res) => {
  try {
    const sort = req.query.sort || 'title';
    const userId = req.user.userId;

    // 경매 데이터 조회
    const auctions = await Auction.findAll({
      attributes: [
        'id', 'artwork_id', 'start_time', 'end_time', 
        'start_price', 'current_price', 'final_price',
        [sequelize.literal('(SELECT COUNT(*) FROM FavoriteAuctions WHERE FavoriteAuctions.auction_id = Auction.id)'), 'favoritesCount']
      ],
      include: [
        {
          model: Artwork,
          as: 'artwork',
          attributes: ['title', 'thumbnail_image_url', 'height', 'width'],
          include: [{ model: Author, as: 'author', attributes: ['author_name'] }]
        }
      ]
    });

    // 사용자가 좋아요한 경매 ID 가져오기
    const likedAuctions = await FavoriteAuction.findAll({
      where: { user_id: userId },
      attributes: ['auction_id']
    });

    const likedAuctionIds = new Set(likedAuctions.map(item => item.auction_id)); 

    let auctionData = auctions.map(auction => auction.get({ plain: true }));

    // 정렬 처리
    switch (sort) {
      case 'popular':
        auctionData = sortByPopular(auctionData);
        break;
      case 'latest':
        auctionData = sortByLatest(auctionData);
        break;
      case 'title':
      default:
        auctionData = sortByTitle(auctionData);
        break;
    }

    const auctionList = auctionData.map(auction => {
      const { artwork } = auction;
      if (!artwork) return null;

      return {
        auction_id: auction.id,
        status: auction.final_price === null ? '경매 진행 중' : '경매 완료',
        thumbnail_image_url: artwork.thumbnail_image_url || '',
        author_name: artwork.author?.author_name || 'Unknown',
        title: artwork.title || 'Unknown',
        height: artwork.height,
        width: artwork.width,
        size: `${artwork.height}cm * ${artwork.width}cm`,
        ...(auction.final_price === null
          ? { start_price: auction.start_price, current_price: auction.current_price }
          : { final_price: auction.final_price }),
        is_liked: likedAuctionIds.has(auction.id) 
      };
    }).filter(Boolean);

    return sendResponse(res, status.SUCCESS, auctionList);
  } catch (error) {
    console.error('getAuctionList 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};

//경매 상세 조회
export const getAuctionDetail = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findByPk(auctionId, {
      attributes: ['id', 'start_time', 'start_price', 'current_price', 'final_price', 'end_time'],
      include: [
        {
          model: Artwork,
          as: 'artwork',
          attributes: ['title', 'thumbnail_image_url', 'year', 'height', 'width', 'number', 'material', 'description'],
          include: [
            {
              model: Author,
              as: 'author',
              attributes: ['id', 'author_name'],
            },
            {
              model: ArtworkImage,
              as: 'images',
              attributes: ['image_url'],
            },
          ],
        },
      ],
    });

    if (!auction) {
      return sendResponse(res, status.AUCTION_NOT_FOUND);
    }

    const calculateRemainingTime = (endTime) => {
      const diff = Math.max(0, new Date(endTime) - new Date());
    
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };
    const remainingTime = calculateRemainingTime(auction.end_time);
 

    const auctionDetail = {
      auction_id: auction.id,
      start_time: convertToKST(auction.start_time),
      end_time: convertToKST(auction.end_time),
      start_price: auction.start_price,
      current_price: auction.current_price,
      final_price: auction.current_price,
      remaining_time: remainingTime, 
      artwork: {
        title: auction.artwork.title,
        thumbnail_image_url: auction.artwork.thumbnail_image_url,
        year: auction.artwork.year,
        material: auction.artwork.material,
        size: `${auction.artwork.height} x ${auction.artwork.width}cm`,
        number: `${auction.artwork.number}호`,
        description: auction.artwork.description,
        author_name: auction.artwork.author?.author_name,
        images: auction.artwork.images?.map(image => image.image_url), 
      },
    };

    return sendResponse(res, status.SUCCESS, auctionDetail);
  } catch (error) {
    console.error('Error fetching auction detail:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};
