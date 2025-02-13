import { DataTypes, Model, Op } from 'sequelize';
import sequelize from '../sequelize.js';
import User from '../User/UserModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import Exhibition from '../Exhibition/ExhibitionModel.js';
import Auction from '../Auction/AuctionModel.js';
import Payment from '../Payment/Payment.js';

class MyPage extends Model {
    // 작품 구매자의 마이페이지 데이터 조회
    static async getBuyerMyPage(user_id) {
        try {
            const paymentCounts = await Payment.findAll({
                where: { buyer_id: user_id },
                attributes: [
                    [sequelize.fn('SUM', sequelize.literal("status = '결제 대기중'")), 'pending'],
                    [sequelize.fn('SUM', sequelize.literal("status = '결제 완료'")), 'completed'],
                    [sequelize.fn('SUM', sequelize.literal("status = '수령 완료'")), 'received'],
                ],
                raw: true,
            });

            const auctions = await Auction.findAll({
                where: { buyer_id: user_id },
                attributes: ['artwork_id', 'end_date', 'price', 'status'],
                include: [{ model: Artwork, attributes: ['title'], include: [{ model: User, as: 'author', attributes: ['name'] }] }],
                limit: 3, order: [['end_date', 'DESC']],
            });

            const payments = await Payment.findAll({
                where: { buyer_id: user_id },
                attributes: ['artwork_id', 'price', 'created_at', 'status'],
                include: [{ model: Artwork, attributes: ['title'], include: [{ model: User, as: 'author', attributes: ['name'] }] }],
                limit: 3, order: [['created_at', 'DESC']],
            });

            const myCollection = {
                artworks: await Artwork.findAll({
                    where: { liked_by: user_id },
                    attributes: ['id', 'title', 'image_url', 'size'],
                    include: [{ model: User, as: 'author', attributes: ['name'] }],
                }),
                exhibitions: await Exhibition.findAll({
                    where: { attended_by: user_id },
                    attributes: ['exhi_id', 'title', 'image_url'],
                }),
            };

            return { paymentCounts, auctions, payments, myCollection };
        } catch (error) {
            throw error;
        }
    }

    // 작가의 마이페이지 데이터 조회
    static async getAuthorMyPage(user_id) {
        try {
            const author = await User.findOne({
                where: { id: user_id, role: 'AUTHOR' },
                attributes: ['name', 'affiliation'],
            });

            const auctions = await Auction.findAll({
                where: { author_id: user_id },
                attributes: ['artwork_id', 'end_date', 'price', 'status'],
                include: [{ model: Artwork, attributes: ['title'], include: [{ model: User, as: 'author', attributes: ['name'] }] }],
                order: [['end_date', 'DESC']],
            });

            const storage = {
                artworks: await Artwork.findAll({ where: { author_id: user_id }, attributes: ['id', 'title', 'image_url', 'size'] }),
                exhibitions: await Exhibition.findAll({ where: { author_id: user_id }, attributes: ['exhi_id', 'title', 'image_url'] }),
            };

            return { author, auctions, storage };
        } catch (error) {
            throw error;
        }
    }
}

export default MyPage;