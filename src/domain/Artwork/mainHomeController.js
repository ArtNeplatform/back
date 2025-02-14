import Artwork from './ArtworkModel.js';
import Author from '../Author/AuthorModel.js';
import User from '../User/UserModel.js';
import Auction from '../Auction/AuctionModel.js';
import Exhibition from '../Exhibition/ExhibitionModel.js';
import sequelize from '../sequelize.js';
import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import FavoriteArtwork from '../Favorite/FavoriteArtworkModel.js';
import FavoriteAuction from '../Favorite/FavoriteAuctionModel.js';

// 사용자가 좋아요한 아이템
const fetchFavoriteItems = async (model, user_id, key) => {
  if (!user_id) return new Set();
  const favorites = await model.findAll({
    where: { user_id },
    attributes: [key]
  });
  return new Set(favorites.map(item => item[key]));
};

// 작품 데이터
const processArtworksData = (artworks, likedArtworks, user_id) => 
  artworks.map(artwork => ({
    artwork_id: artwork.id,
    author_name: artwork.author?.author_name,
    thumbnail_image_url: artwork.thumbnail_image_url,
    title: artwork.title,
    height: Number(artwork.height),
    width: Number(artwork.width),
    size: `${artwork.height}cm * ${artwork.width}cm`,
    is_like: user_id ? likedArtworks.has(artwork.id) : false
  }));

// 경매 데이터
const processAuctionsData = (auctions, likedAuctions, user_id) => 
  auctions.map(auction => ({
    auction_id: auction.id,
      author_name: auction.artwork.author?.author_name,
    thumbnail_image_url: auction.artwork.thumbnail_image_url,
    title: auction.artwork.title,
    height: Number(auction.artwork.height),
    width: Number(auction.artwork.width),
    size: `${auction.artwork.height}cm * ${auction.artwork.width}cm`,
    start_price: Number(auction.start_price),
    current_price: Number(auction.current_price),
    is_like: user_id ? likedAuctions.has(auction.id) : false
  }));

// 작가 데이터
const processAuthorsData = async authors => {
  return Promise.all(
    authors.map(async author => {
      const [artworkCount, exhibitionCount] = await Promise.all([
        Artwork.count({ where: { author_id: author.id } }),
        Exhibition.count({ where: { author_id: author.id } })
      ]);

      const artwork = await Artwork.findOne({
        where: { author_id: author.id },
        attributes: ['thumbnail_image_url']
      });

      return {
        author_id: author.id,
        author_name: author.author_name,
        author_image_url: author.author_image_url,
        artwork_count: Number(artworkCount),
        exhibition_count: Number(exhibitionCount),
        artwork_image_url: artwork?.thumbnail_image_url || null
      };
    })
  );
};

//메인홈 조회 API
export const getMainHomeData = async (req, res) => {
  try {
    const email = req.user?.email || null;
    let user_id = null;

    if (email) {
      const user = await User.findOne({ where: { email }, attributes: ['id'] });
      user_id = user.id
    }

    // 1. 작품 정보 가져오기(좋아요 순)
    const artworks = await Artwork.findAll({
      limit: 4,
      attributes: [
        'id', 'thumbnail_image_url', 'title', 'height', 'width',
        [sequelize.literal('(SELECT COUNT(*) FROM FavoriteArtworks WHERE FavoriteArtworks.artwork_id = Artwork.id)'), 'favorite_count']
      ],
      include: [{ model: Author, as: 'author', attributes: ['author_name', 'id'] }],
      order: [[sequelize.literal('favorite_count'), 'DESC']]
    });

    const likedArtworks = await fetchFavoriteItems(FavoriteArtwork, user_id, 'artwork_id');
    const artworksData = processArtworksData(artworks, likedArtworks, user_id);

    // 2. 진행 중인 경매 정보 가져오기(좋아요 순)
    const ongoingAuctions = await Auction.findAll({
      where: { final_price: null },
      limit: 4,
      attributes: [
        'id', 'start_price', 'current_price', 'end_time',
        [sequelize.literal('(SELECT COUNT(*) FROM FavoriteAuctions WHERE FavoriteAuctions.auction_id = Auction.id)'), 'favorite_count']
      ],
      include: [{
        model: Artwork,
        as: 'artwork',
        attributes: ['id', 'thumbnail_image_url', 'title', 'height', 'width'],
        include: [{ model: Author, as: 'author', attributes: ['author_name', 'id'] }]
      }],
      order: [[sequelize.literal('favorite_count'), 'DESC']]
    });

    const likedAuctions = await fetchFavoriteItems(FavoriteAuction, user_id, 'auction_id');
    const ongoingAuctionsData = processAuctionsData(ongoingAuctions, likedAuctions, user_id);

    // 3. 작가 정보 가져오기
    const authors = await Author.findAll({
      limit: 5,
      attributes: ['id', 'author_name', 'author_image_url']
    });

    const authorsData = await processAuthorsData(authors);

    // 4. 전시 정보 가져오기
    const ongoingExhibitions = await Exhibition.findAll({
      limit: 7,
      attributes: ['id', 'image_url', 'title'],
      order: sequelize.fn('RAND')
    });

    const ongoingExhibitionsData = ongoingExhibitions.map(exhibition => ({
      exhibition_id: exhibition.id,
      image_url: exhibition.image_url,
      title: exhibition.title
    }));

    // 최종 응답 데이터 
    const data = {
      artworks: artworksData,
      ongoingAuctions: ongoingAuctionsData,
      authors: authorsData,
      ongoingExhibitions: ongoingExhibitionsData
    };

    return sendResponse(res, status.SUCCESS, data);
  } catch (error) {
    console.error('Error fetching main home data:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};
