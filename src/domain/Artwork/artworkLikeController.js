import FavoriteArtwork from '../Favorite/FavoriteArtworkModel.js';  
import User from '../User/UserModel.js';  
import Artwork from './ArtworkModel.js';  
import { BaseError } from '../../../config/error.js';  
import { response } from '../../../config/response.js';  
import { status } from '../../../config/response.status.js';  

// 좋아요 추가 함수
export const addFavoriteArtwork = async (req, res) => {
  try {
    const { artworkId } = req.params;

    // 필수 데이터 검증
    if (!artworkId) {
      throw new BaseError({
        message: 'Required fields are missing.',
        code: 'BAD_REQUEST',
      });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { email: req.user.email } });
    if (!user) {
      throw new BaseError({
        message: 'User not found.',
        code: 'USER_NOT_FOUND',
      });
    }

    // 작품이 존재하는지 확인
    const artwork = await Artwork.findByPk(artworkId);
    if (!artwork) {
      throw new BaseError({
        message: 'Artwork not found.',
        code: 'NOT_FOUND',
      });
    }

    // 이미 좋아요가 되어 있는지 확인
    const existingFavorite = await FavoriteArtwork.findOne({
      where: {
        user_id: user.id,
        artwork_id: artworkId,
      },
    });

    if (existingFavorite) {
      throw new BaseError({
        message: 'You have already liked this artwork.',
        code: 'BAD_REQUEST',
      });
    }

    // 좋아요 추가
    const new_favorite = await FavoriteArtwork.create({
      user_id: user.id,
      artwork_id: artworkId,
    });

    return res.status(status.SUCCESS.status).json(
      response(status.SUCCESS, { new_favorite })
    );
  } catch (error) {
    console.error('Error adding favorite artwork:', error);
    if (error instanceof BaseError) {
      return res.status(400).json(response(status.BAD_REQUEST, error.message));
    }
    return res.status(500).json(
      response(status.INTERNAL_SERVER_ERROR, 'Internal server error.')
    );
  }
};
