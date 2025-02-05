import FavoriteArtwork from '../Favorite/FavoriteArtworkModel.js';  
import User from '../User/UserModel.js';  
import Artwork from './ArtworkModel.js';  
import { BaseError } from '../../../config/error.js';  
import { response } from '../../../config/response.js';  
import { status } from '../../../config/response.status.js';  

// 좋아요 토글 함수 (등록 & 취소)
export const toggleFavoriteArtwork = async (req, res) => {
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

    // 기존 좋아요 여부 확인 
    const existingFavorite = await FavoriteArtwork.findOne({
      where: {
        user_id: user.id,
        artwork_id: artworkId,
      },
    });

    if (existingFavorite) {
      // 이미 좋아요를 눌렀다면 삭제 (좋아요 취소)
      await existingFavorite.destroy();
      return res.status(status.SUCCESS.status).json(
        response(status.SUCCESS, { message: '좋아요가 취소되었습니다.' })
      );
    } else {
      // 좋아요 추가
      const newFavorite = await FavoriteArtwork.create({
        user_id: user.id,
        artwork_id: artworkId,
      });

      return res.status(status.SUCCESS.status).json(
        response(status.SUCCESS, { message: '좋아요가 추가되었습니다.', newFavorite })
      );
    }
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
