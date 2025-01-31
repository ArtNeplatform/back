import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Auction from './Auction.js';
import AuctionBid from './AuctionBid.js';
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

export const createAuction = async (req, res) => {
  
};