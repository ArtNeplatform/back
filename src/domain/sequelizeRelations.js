import Artwork from './Artwork/ArtworkModel.js';
import AuctionBid from './Auction/AuctionbidModel.js';
import Auction from './Auction/AuctionModel.js';
import Author from './Author/AuthorModel.js';
import User from './User/UserModel.js';
import FavoriteAuction from './Favorite/FavoriteAuction.js';

Author.belongsTo(User, { foreignKey: 'user_id' }); 
Artwork.belongsTo(Author, { foreignKey: 'author_id', as: 'author' });
Author.hasMany(Artwork, { foreignKey: 'author_id', as: 'artworks' });
Auction.belongsTo(Artwork, { foreignKey: 'artwork_id', as: 'artwork' });
Auction.hasMany(AuctionBid, { foreignKey: 'auction_id', as: 'bids' });
AuctionBid.belongsTo(Auction, { foreignKey: 'auction_id', as: 'auction' });
AuctionBid.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
FavoriteAuction.belongsTo(User, { foreignKey: 'user_id' });
FavoriteAuction.belongsTo(Auction, { foreignKey: 'auction_id' });
