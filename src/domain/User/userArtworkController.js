import { Op } from 'sequelize';
import User from '../User/UserModel.js';
import Author from '../Author/AuthorModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import Payment from '../Payment/PaymentModel.js';
import Auction from '../Auction/AuctionModel.js';
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';


// 소수점 이하 불필요한 0 삭제
const formatNumber = (num) => {
    const number = Number(num);
    return isNaN(number) ? null : (number % 1 === 0 ? number.toString() : number.toFixed(2).replace(/\.?0+$/, ''));
};


// 사용자가 구매한 작품 조회 API
export const getUserPurchasedArtworks = async (req, res) => {
  try {
    const user = req.user; 
    if (!user) {
      return res.status(401).json(response(status.UNAUTHORIZED, 'Unauthorized user.'));
    }

    // User 테이블에서 user_id 조회
    const userData = await User.findOne({ where: { email: user.email } });
    if (!userData) {
      return res.status(404).json(response(status.NOT_FOUND, 'User not found.'));
    }

    // 결제된 작품 조회
    const payments = await Payment.findAll({
      where: { user_id: userData.id, payment_status: 'COMPLETED' }, // 결제 완료된 작품만 조회
      include: [
        {
          model: Auction, 
          as: 'auction',
          include: [
            {
              model: Artwork, 
              as: 'artwork',
              attributes: ['id', 'title', 'width', 'height'],
              include: [
                {
                  model: Author,
                  as: 'author',
                  attributes: ['author_name'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!payments.length) {
      return res.status(404).json(response(status.NOT_FOUND, 'No purchased artworks found.'));
    }

    // 응답 데이터 구성
    const responseData = payments.map((payment) => ({
      author_name: payment.auction.artwork.author.author_name,
      title: payment.auction.artwork.title,
      size: `${formatNumber(payment.auction.artwork.width)}cm*${formatNumber(payment.auction.artwork.height)}cm`,
    }));

    return res.status(200).json(response(status.SUCCESS, responseData));
  } catch (error) {
    console.error('Error in getUserPurchasedArtworks:', error);
    return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, 'Internal server error.'));
  }
};
