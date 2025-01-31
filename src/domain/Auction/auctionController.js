import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Auction from './AuctionModel.js';
import AuctionBid from './AuctionbidModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import Author from '../Author/AuthorModel.js';


export const getAvailableArtworks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const author = await Author.findOne({ where: { user_id: userId } });

        if (!author) {
            return sendResponse(res, status.AUTHOR_NOT_FOUND, null);
        }

        const artworks = await Artwork.findAll({
            where: { author_id: author.id },
            attributes: ['id', 'title', 'thumbnail_image_url']
        });

        return sendResponse(res, status.SUCCESS, artworks);
    } catch (error) {
        console.error('getAvailableArtworks 에러:', error);
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};

export const getAuctionList = async (req, res) => {
 
};

export const getAuctionDetail = async (req, res) => {
   
};

export const registerAuction = async (req, res) => {
  try {
    const { artwork_id, start_price, end_time } = req.body;
    const artwork = await Artwork.findOne({ where: { id: artwork_id } });
    if (!artwork) {
      return sendResponse(res, status.ARTWORK_NOT_FOUND, null);
    }

    const existAuction = await Auction.findOne({
      where: { artwork_id },
      attributes: ['end_time']
    });

    if (existAuction) {
      const auctionEndTime = new Date(existAuction.end_time);
      const currentTime = new Date();
      if (auctionEndTime > currentTime) {
        return sendResponse(res, status.AUCTION_ALREADY_ONGOING);
      }
    }
    const newAuction = await Auction.create({
      artwork_id,
      start_price,
      current_price: start_price,
      start_time: new Date(),
      end_time,
    });

    return sendResponse(res, status.SUCCESS, newAuction);
  } catch (error) {
    console.error('registerAuction 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};
  
export const bidAuction = async (req, res) => {
  
};