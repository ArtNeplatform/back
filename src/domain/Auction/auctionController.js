import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Auction from './AuctionModel.js';
import AuctionBid from './AuctionbidModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import ArtworkImage from '../Artwork/ArtworkImageModel.js';
import Author from '../Author/AuthorModel.js';
import { broadcastToClients } from '../../../config/webSocket.js'; 

//경매 가능 작품 조회
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

    const availableArtworks = artworks.filter(artwork => {
      const auction = ongoingAuctions.find(a => a.artwork_id === artwork.id);

      return !(auction && (auction.final_price !== null || new Date(auction.end_time) > new Date()));
    });

    return sendResponse(res, status.SUCCESS, availableArtworks);
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
    if (!artwork) {
      return sendResponse(res, status.ARTWORK_NOT_FOUND, null);
    }

    const inputEndTime = new Date(end_time);
    const currentTime = new Date();

    if (inputEndTime <= currentTime) {
      return sendResponse(res, status.INVALID_END_TIME, null);
    }

    const completedAuction = await Auction.findOne({
      where: { artwork_id },
      attributes: ['id', 'end_time', 'final_price']
    });

    if (completedAuction && completedAuction.final_price !== null) {
      return sendResponse(res, status.AUCTION_ALREADY_COMPLETED, null);
    }

    const ongoingAuction = await Auction.findOne({
      where: { artwork_id },
      attributes: ['end_time']
    });

    if (ongoingAuction) {
      const auctionEndTime = new Date(ongoingAuction.end_time);
      if (auctionEndTime > currentTime) {
        return sendResponse(res, status.AUCTION_ALREADY_ONGOING, null);
      }
    }

    const newAuction = await Auction.create({
      artwork_id,
      start_price,
      current_price: start_price,
      start_time: currentTime,
      end_time: inputEndTime,
    });

    return sendResponse(res, status.SUCCESS, newAuction);
  } catch (error) {
    console.error('registerAuction 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};

// 경매 입찰
export const bidAuction = async (req, res) => {
    try {
        const { auctionId, bidPrice } = req.body;
        const userId = req.user.userId;

        const bidData = (bid) => ({
          bid_id: bid.id,
          auction_id: bid.auction_id,
          user_id: bid.user_id,
          bid_price: bid.bid_price,
          bid_date: bid.bid_date,
          status: bid.status
      });

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

        if (!auction) {
            return sendResponse(res, status.AUCTION_NOT_FOUND);
        }

        if (Number(auction.artwork.author.user_id) === Number(userId)) {
            return sendResponse(res, status.CANNOT_BID_OWN_AUCTION);
        }

        if (bidPrice <= auction.start_price) {
            return sendResponse(res, status.BID_LOWER_THAN_START_PRICE);
        }

        if (bidPrice <= auction.current_price) {
            return sendResponse(res, status.BID_LOWER_THAN_CURRENT_PRICE);
        }

        const currentBidder = await AuctionBid.findOne({
            where: { auction_id: auctionId, status: 'BID' }
        });

        if (currentBidder) {
            await currentBidder.update({ status: 'PARTICIPATE' });
        }
        

        const newBid = await AuctionBid.create({
            auction_id: auctionId,
            user_id: userId,
            bid_price: bidPrice,
            bid_date: new Date(),
            status: 'BID'
        });

        auction.current_price = bidPrice;
        const filterdBid = bidData(newBid);
        await auction.save();

        broadcastToClients(status.SUCCESS, filterdBid);
        return sendResponse(res, status.SUCCESS, filterdBid);
    } catch (error) {
        console.error('bidAuction 에러:', error);
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};

// 경매 상세 조회
export const getAuctionDetail = async (req, res) => {
  try {
      const { auctionId } = req.params;
      const auction = await Auction.findByPk(auctionId, {
          attributes: ['start_time', 'start_price', 'current_price', 'final_price', 'end_time'],
          include: {
              model: Artwork,
              as: 'artwork',
              attributes: ['title', 'thumbnail_image_url', 'year', 'height', 'width', 'number', 'material', 'description'],
              include: [
                  {
                      model: Author,
                      as: 'author',
                      attributes: ['id', 'author_name']
                  },
                  {
                      model: ArtworkImage,
                      as: 'images',
                      attributes: ['image_url']
                  }
              ]
          }
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
        start_price: auction.start_price,  
        current_price: auction.current_price,
        final_price: auction.final_price || auction.current_price,
        remaining_time: remainingTime,
        artwork: {
            author_name: auction.artwork.author?.author_name,
            title: auction.artwork.title,
            year: auction.artwork.year,
            material: auction.artwork.material,
            height: auction.artwork.height,
            width: auction.artwork.width,
            size : auction.artwork.height + " x " + auction.artwork.width + "cm",
            number: auction.artwork.number + "호",
            description: auction.artwork.description,
            thumbnail_image_url: auction.artwork.thumbnail_image_url,
            images: auction.artwork.images.map(image => image.image_url)
        }
    };
      return sendResponse(res, status.SUCCESS, auctionDetail);
  } catch (error) {
      console.error('getAuctionDetail 에러:', error);
      return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};

//경매 리스트 조회
export const getAuctionList = async (req, res) => {
  try {
    const sort = req.query.sort || 'title'; 
    console.log('Sorting condition:', sort);

    const auctions = await Auction.findAll({
      attributes: ['id', 'artwork_id', 'start_time', 'end_time', 'start_price', 'current_price', 'final_price'],
      include: [
        {
          model: Artwork,
          as: 'artwork',
          attributes: ['title', 'thumbnail_image_url', 'height', 'width'],
          include: [{ model: Author, as: 'author', attributes: ['author_name'] }]
        },
        {
          model: AuctionBid,
          as: 'bids',
          attributes: ['id']
        }
      ]
    });

    let auctionData = auctions.map(auction => auction.get({ plain: true }));

    switch (sort) {
      case 'popular':  
        auctionData.sort((a, b) => b.bids.length - a.bids.length);
        break;

      case 'latest':  
        auctionData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        break;

      case 'title':  
      default:
        auctionData.sort((a, b) => {
          const titleA = a.artwork?.title || '';
          const titleB = b.artwork?.title || '';
          return titleA.localeCompare(titleB, 'ko', { sensitivity: 'base' });
        });
        break;
    }

    const auctionList = auctionData.map(auction => {
      const { artwork } = auction;
      if (!artwork) return null;

      const auctionStatus = new Date(auction.end_time) > new Date() ? '경매 진행 중' : '경매 완료';

      return {
        auction_id: auction.id,
        status: auctionStatus,
        thumbnail_image_url: artwork.thumbnail_image_url || '',
        author_name: artwork.author?.author_name || 'Unknown',
        title: artwork.title || 'Unknown',
        height : artwork.height,
        width : artwork.width,
        size: artwork.height + "cm" + "*" +  artwork.width + "cm",
        ...(auctionStatus === '경매 진행 중'
          ? { start_price: auction.start_price, current_price: auction.current_price }
          : { final_price: auction.final_price }),
      };
    }).filter(Boolean);

    return sendResponse(res, status.SUCCESS, auctionList);
  } catch (error) {
    console.error('getAuctionList 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};
