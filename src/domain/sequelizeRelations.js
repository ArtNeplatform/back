import Artwork from './Artwork/ArtworkModel.js';
import Author from './Author/AuthorModel.js';
import User from './User/UserModel.js';

Author.belongsTo(User, { foreignKey: 'user_id' }); 
Artwork.belongsTo(Author, { foreignKey: 'author_id', as: 'author' });
Author.hasMany(Artwork, { foreignKey: 'author_id', as: 'artworks' });