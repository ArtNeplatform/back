import Artwork from './ArtworkModel.js';
import Author from '../Author/AuthorModel.js';
import Auction from '../Auction/AuctionModel.js';
import Exhibition from '../Exhibition/ExhibitionModel.js';
import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';

export const getMainHomeData = async (req, res) => {
  try {

    // 1. 작품 정보
    const artworks = await Artwork.findAll({
      limit: 4,
      attributes: ['id', 'thumbnail_image_url', 'title', 'height', 'width'],
      include: [{
        model: Author,
        as: 'author',
        attributes: ['author_name', 'id'], 
      }],
    });

    const artworskData = artworks.map((artwork) => {
      const plainArtwork = artwork.get({ plain: true });
      return {
        artwork_id: plainArtwork.id,  
        author_name: plainArtwork.author?.author_name,
        author_id: plainArtwork.author?.id,  
        thumbnail_image_url: plainArtwork.thumbnail_image_url,
        title: plainArtwork.title,
        height: plainArtwork.height,
        width: plainArtwork.width,
        size: `${plainArtwork.height}cm*${plainArtwork.width}cm`,
      };
    });

    // 2. 경매 정보
    const ongoingAuctions = await Auction.findAll({
      where: {
        final_price: null,
      },
      limit: 4,
      attributes: ['id', 'start_price', 'current_price', 'end_time'],  
      include: [{
        model: Artwork,
        as: 'artwork',
        attributes: ['id', 'thumbnail_image_url', 'title', 'height', 'width'],
        include: [{
          model: Author,
          as: 'author',
          attributes: ['author_name', 'id'],  
        }],
      }],
    });

    const ongoingAuctionsData = ongoingAuctions.map((auction) => {
      const plainAuction = auction.get({ plain: true });
      const artwork = plainAuction.artwork;
      return {
        auction_id: plainAuction.id,  
        thumbnail_image_url: artwork.thumbnail_image_url,
        title: artwork.title,
        author_name: artwork.author?.author_name,
        author_id: artwork.author?.id,  
        height: artwork.height,
        width: artwork.width,
        size: `${artwork.height}cm * ${artwork.width}cm`,
        start_price: plainAuction.start_price,
        current_price: plainAuction.current_price,
      };
    });

    // 3. 작가 정보
    const authors = await Author.findAll({
      limit: 5,
      attributes: ['id', 'author_name', 'author_image_url'],
    });

    const authorsData = await Promise.all(
      authors.map(async (author) => {
        const [artworkCount, exhibitionCount] = await Promise.all([
          Artwork.count({ where: { author_id: author.id } }),
          Exhibition.count({ where: { author_id: author.id } }),
        ]);

        const artwork = await Artwork.findOne({
          where: { author_id: author.id },
          attributes: ['thumbnail_image_url'],
        });

        return {
          author_id: author.id,  
          author_name: author.author_name,
          author_image_url: author.author_image_url,
          artwork_count: artworkCount,
          exhibition_count: exhibitionCount,
          artwork_image_url: artwork?.thumbnail_image_url || null,
        };
      })
    );

    // 4. 전시 정보
    const ongoingExhibitions = await Exhibition.findAll({
      limit: 7,
      attributes: ['id', 'image_url', 'title'], 
    });

    const ongoingExhibitionsData = ongoingExhibitions.map((exhibition) => ({
      exhibition_id: exhibition.id,  
      image_url: exhibition.image_url,
      title: exhibition.title,
    }));

    const data = {
      artworks: artworskData,
      ongoingAuctions: ongoingAuctionsData,
      authors: authorsData,
      ongoingExhibitions: ongoingExhibitionsData,
    };

    return sendResponse(res, status.SUCCESS, data);
  } catch (error) {
    console.error('Error fetching main home data:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
};
