import { DataTypes, Model, Op, Sequelize } from 'sequelize';
import sequelize from '../sequelize.js';
import User from '../User/UserModel.js';
import Author from '../Author/AuthorModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import Exhibition from '../Exhibition/ExhibitionModel.js';
import Auction from '../Auction/AuctionModel.js';
import AuctionBid from '../Auction/AuctionbidModel.js';
import FavoriteArtwork from '../Favorite/FavoriteArtworkModel.js';
import FavoriteExhibition from '../Favorite/FavoriteExhibitionModel.js';
import Payment from '../Payment/PaymentModel.js';

class MyPage extends Model {
    // 작품 구매자의 마이페이지 데이터 조회
    static async getBuyerMyPage(user_id) {
        try {
            // 사용자 정보 조회 (이름 & 프로필 사진 추가)
            const buyer = await User.findOne({
                where: { id: user_id },
                attributes: ['name', 'profile_image_url']
            });

            // 결제 진행 상황 카운트
            const paymentCounts = await Payment.findAll({
                where: { user_id: user_id },
                attributes: [
                    [sequelize.fn('SUM', sequelize.literal("payment_status = '결제 대기중'")), 'pending'],
                    [sequelize.fn('SUM', sequelize.literal("payment_status = '결제 완료'")), 'completed'],
                    [sequelize.fn('SUM', sequelize.literal("payment_status = '수령 완료'")), 'received'],
                ],
                raw: true,
            });

            // 경매 입찰 내역 (최대 3개)
            const auctions = await AuctionBid.findAll({
                where: { user_id: user_id },
                attributes: ['auction_id', 'bid_date', 'bid_price', 'status'],
                include: [{
                    model: Auction,
                    as: 'auction',
                    attributes: ['artwork_id'],  // Auction에서 artwork_id 가져오기
                    include: [{
                        model: Artwork,
                        as: 'artwork',
                        attributes: ['title'],
                        include: [{ model: Author, as: 'author', attributes: ['author_name', 'author_image_url'] }]
                    }]
                }],
                limit: 3, order: [['bid_date', 'DESC']],
            });

            // 결제 내역 (최대 3개) + `payment_id` 추가
            const payments = await Payment.findAll({
                where: { user_id: user_id },
                attributes: ['id', 'auction_id', 'payment_price', 'created_at', 'payment_status'], 
                include: [{
                    model: Auction,
                    as: 'auction',
                    attributes: ['artwork_id'], 
                    include: [{
                        model: Artwork,
                        as: 'artwork',
                        attributes: ['title'],
                        include: [{ model: Author, as: 'author', attributes: ['author_name', 'author_image_url'] }] // 수정된 부분
                    }]
                }],
                limit: 3, 
                order: [['created_at', 'DESC']],
            });

            // 좋아요한 작품 조회
            const likedArtworks = await FavoriteArtwork.findAll({
                where: { user_id: user_id },
                attributes: ['artwork_id'],
                include: [{
                    model: Artwork,
                    as: 'artwork',
                    attributes: ['id', 'title', 'thumbnail_image_url', 'height', 'width'],
                    include: [{ model: Author, as: 'author', attributes: ['author_name', 'author_image_url'] }]
                }]
            });

            // 좋아요한 전시 조회
            const likedExhibitions = await FavoriteExhibition.findAll({
                where: { user_id: user_id },
                include: [{
                    model: Exhibition,
                    as: 'exhibition',
                    attributes: ['id', 'title', 'image_url']
                }]
            });

            const myCollection = {
                artworks: likedArtworks.map(item => item.artwork),
                exhibitions: likedExhibitions.map(item => item.exhibition),
            };

            return { buyer, paymentCounts, auctions, payments, myCollection };
        } catch (error) {
            throw error;
        }
    }

    // 작가의 마이페이지 데이터 조회
    static async getAuthorMyPage(user_id) {
        try {
            // 작가 프로필 정보 조회 (이름 & 프로필 사진 추가)
            const author = await User.findOne({
                where: { id: user_id, role: 'AUTHOR' },
                attributes: ['name', 'profile_image_url']
            });
            
            // 경매 입찰 내역 조회 (최대 3개)
            const auctions = await AuctionBid.findAll({
                where: { user_id: user_id },
                attributes: ['auction_id', 'bid_date', 'bid_price', 'status'],
                include: [{
                    model: Auction,
                    as: 'auction',
                    attributes: ['artwork_id'],  // Auction에서 artwork_id 가져오기
                    include: [{
                        model: Artwork,
                        as: 'artwork',
                        attributes: ['title'],
                        include: [{ model: Author, as: 'author', attributes: ['author_name', 'author_image_url'] }]
                    }]
                }],
                limit: 3, order: [['bid_date', 'DESC']],
            });

            // 작가의 작품 & 전시 목록 조회
            const storage = {
                artworks: await Artwork.findAll({
                    where: { author_id: user_id },
                    attributes: ['id', 'title', 'thumbnail_image_url', 'height', 'width'],
                    include: [
                        {
                            model: Author,
                            as: 'author',
                            attributes: ['author_name'] // 작가 이름 추가
                        }
                    ]
                }),
                exhibitions: await Exhibition.findAll({
                    where: { author_id: user_id },
                    attributes: ['id', 'title', 'image_url']
                }),
            };

            return { author, auctions, storage };
        } catch (error) {
            throw error;
        }
    }
}

export default MyPage;