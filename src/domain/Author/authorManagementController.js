import { Op } from 'sequelize';
import User from '../User/UserModel.js';
import Author from './AuthorModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import Auction from '../Auction/AuctionModel.js';
import Exhibition from '../Exhibition/ExhibitionModel.js';
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';


const formatDate = (date) => {

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';  
    }
    
    // 날짜를 '년도. 월. 일' 형식으로 포맷
    const year = d.getFullYear();
    const month = d.getMonth() + 1; 
    const day = d.getDate();
    
    // '2025. 1. 25' 형식으로 반환
    return `${year}. ${month}. ${day}`;
};


// 작가의 작품, 경매 중인 작품, 전시 정보 조회 API
export const getAuthorDetails = async (req, res) => {
  try {
    const user = req.user; // 로그인된 사용자 정보

    if (!user) {
      return res.status(401).json(response(status.UNAUTHORIZED, 'Unauthorized user.'));
    }

    // User 테이블에서 user_id 조회
    const userData = await User.findOne({ where: { email: user.email } });

    if (!userData) {
      return res.status(404).json(response(status.NOT_FOUND, 'User not found.'));
    }

    // Author 테이블에서 해당 user_id를 가진 작가 정보 조회
    const author = await Author.findOne({ where: { user_id: userData.id } });

    if (!author) {
      return res.status(404).json(response(status.NOT_FOUND, 'Author not found.'));
    }

    // 작품 리스트 조회
    const artworks = await Artwork.findAll({
      where: { author_id: author.id },
      attributes: ['id', 'title', 'thumbnail_image_url'],
    });

    // 경매 중인 작품 조회 (현재 시간이 경매 기간 내에 있는 작품)
    const auction_artworks = await Auction.findAll({
      where: {
        end_time: { [Op.gt]: new Date() }, // 현재 시간이 종료 시간보다 전인 경매
      },
      include: [
        {
          model: Artwork,
          as: 'artwork',
          where: { author_id: author.id },
          attributes: ['id', 'title', 'thumbnail_image_url'],
        },
      ],
    });

    // 진행 중인 전시 조회
    const exhibitions = await Exhibition.findAll({
      where: {
        author_id: author.id,
        end_date: { [Op.gt]: new Date() }, // 현재 시간보다 종료일(end_date)이 이후인 전시만 조회
      },
      attributes: ['id', 'title', 'image_url', 'created_at', 'end_date'],
    });

    // 응답 데이터 구성
    const responseData = {
      author: {
        id: author.id,
      },
      artworks: artworks.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        thumbnail_image_url: artwork.thumbnail_image_url,
      })),
      auction_artworks: auction_artworks.map((auction) => ({
        auction_id: auction.id,
        auction_period: `${formatDate(auction.start_time)} - ${formatDate(auction.end_time)}`,
        artwork: {
          id: auction.artwork.id,
          title: auction.artwork.title,
          thumbnail_image_url: auction.artwork.thumbnail_image_url,
        },
      })),
      exhibitions: exhibitions.map((exhibition) => ({
        id: exhibition.id,
        title: exhibition.title,
        image_url: exhibition.image_url,
        //created_at: exhibition.created_at,
      })),
    };

    return res.status(200).json(response(status.SUCCESS, responseData));
  } catch (error) {
    console.error('Error in getAuthorDetails:', error);
    return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, 'internal server error.'));
  }
};
