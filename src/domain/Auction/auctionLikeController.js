import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Auction from './AuctionModel.js';
import User from '../User/UserModel.js';
import FavoriteAuction from '../Favorite/FavoriteAuctionModel.js';


// 경매 좋아요
export const addFavoriteAuction = async (req, res, next) => {
  try {
    const email = req.user.email
    const user = await User.findOne({ where: { email }, attributes: ['id'] });
    const user_id = user.id;

    const { auction_id } = req.params;

    const auction = await Auction.findByPk(auction_id);
    if (!auction) return sendResponse(res, status.AUCTION_NOT_FOUND);

    const existingFavorite = await FavoriteAuction.findOne({
      where: { user_id: user_id, auction_id: auction_id },
    });

    if (existingFavorite) return sendResponse(res, status.AUCTION_ALREADY_FAVORITED);

    await FavoriteAuction.create({ user_id: user_id, auction_id: auction_id });

    return sendResponse(res, status.SUCCESS);
  } catch (error) {
    console.log(error)
  }
};

// 경매 좋아요 취소
export const removeFavoriteAuction = async (req, res, next) => {
  try {
    const email = req.user.email
    const user = await User.findOne({ where: { email }, attributes: ['id'] });
    const user_id = user.id;
    const { auction_id } = req.params;

    const auction = await Auction.findByPk(auction_id);
    if (!auction) return sendResponse(res, status.AUCTION_NOT_FOUND);

    const favorite = await FavoriteAuction.findOne({
      where: { user_id: user_id, auction_id: auction_id },
    });

    if (!favorite) return sendResponse(res, status.AUCTION_FAVORITE_NOT_FOUND);

    await favorite.destroy();

    return sendResponse(res, status.SUCCESS);
  } catch (error) {
    console.log(error)
  }
};
