import express from 'express';
import Exhibition from './ExhibitionModel.js'; // Exhibition 모델 불러오기
import FavoriteExhibition from '../Favorite/FavoriteExhibitionModel.js';
import Artwork from '../Artwork/ArtworkModel.js';  // 작가의 작품 리스트 가져오기
import Author from '../Author/AuthorModel.js';
import User from '../User/UserModel.js';
import uploadMiddleware from '../../../config/uploadMiddleware.js';
import upload from '../../../config/upload.js';
import s3 from '../../../config/aws.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import { BaseError } from '../../../config/error.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { sendResponse } from '../../../config/response.js';
import { Sequelize, Op } from 'sequelize';


const router = express.Router();

// S3 업로드 함수
const uploadImageToS3 = async (image) => {
  const fileName = `exhibitions/${uuidv4()}${path.extname(image.originalname)}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: image.buffer,
    ContentType: image.mimetype
  };

  const uploadResult = await s3.upload(params).promise();
  if (!uploadResult || !uploadResult.Location) {
    throw new BaseError({
      message: 'Failed to upload image to S3.',
      code: 'UPLOAD_FAILED',
    });
  }

  return uploadResult.Location;
};

// 전시 리스트 조회 API
router.get('/exhibitions', async (req, res) => {
  try {
    const sort = req.query.sort || 'title';  
    const result = await Exhibition.getExhibitions(sort);

    if (!result || result.length === 0) {
      return sendResponse(res, status.NOT_FOUND);
    }

    return sendResponse(res, status.SUCCESS, result);
    
  } catch (error) {
    console.error('전시 조회 에러:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
});



// 전시 등록 API
router.post('/exhibitions', verifyToken, upload.array('exhibition_image', 1), async (req, res) => {
  try {
    const { title, gallery_id, popularity } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return sendResponse(res, status.UPLOAD_NO_FILE);
    }

    const imageUrl = await uploadImageToS3(files[0]);

    const { email } = req.user;
    const user = await User.findOne({ where: { email } });
    const author_id = user.id;

    const exhibition = await Exhibition.create({
      author_id,
      gallery_id,
      title,
      popularity,
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      image_url: imageUrl,
    });

    return sendResponse(res, status.SUCCESS, null);
  } catch (error) {
    console.error('Unexpected Error:', error);
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
});




//전시 상세 조회 API
router.get('/exhibitions/:exhibition_id', async (req, res) => {
  try {
    const { exhibition_id } = req.params;
    const user_id = req.user.id;

    const exhibition = await Exhibition.findOne({
      attributes: ['id', 'title', 'image_url', 'author_id'],
      where: { id: exhibition_id },
    });

    if (!exhibition) {
      return sendResponse(res, status.EXHIBITION_NOT_FOUND);
    }

    const author = await Author.findOne({
      attributes: ['author_name', 'author_image_url'],
      where: { id: exhibition.author_id },
    });

    if (!author) {
      return sendResponse(res, status.AUTHOR_NOT_FOUND);
    }

    // 사용자가 해당 전시를 마이컬렉션에 추가했는지 확인
    const isFavorite = await FavoriteExhibition.findOne({
      where: { user_id, exhibition_id },
    });

    const authorExhibitions = await Exhibition.findAll({
      attributes: ['id', 'title', 'image_url'],
      where: {
        author_id: exhibition.author_id,
        id: { [Op.ne]: exhibition.id },
      },
      order: Sequelize.fn('RAND'),
      limit: 2,
    });

    const authorArtworks = await Artwork.findAll({
      attributes: ['id', 'thumbnail_image_url'],
      where: { author_id: exhibition.author_id },
      order: Sequelize.fn('RAND'),
      limit: 4,
    });

    return sendResponse(res, status.SUCCESS, {
      exhibition: {
        exhibition_id: exhibition.id,
        title: exhibition.title,
        image_url: exhibition.image_url,
        is_favorite: !!isFavorite, // 마이컬렉션 추가 여부
      },
      author: {
        author_id: exhibition.author_id,
        name: author.author_name,
        image_url: author.author_image_url,
      },
      author_exhibitions: authorExhibitions.map((exhibition) => ({
        exhibition_id: exhibition.id,
        title: exhibition.title,
        image_url: exhibition.image_url,
      })),
      author_artworks: authorArtworks.map((artwork) => ({
        artwork_id: artwork.id,
        image_url: artwork.thumbnail_image_url,
      })),
    });

  } catch (error) {
    console.error("Error occurred:", error);  
    return sendResponse(res, status.INTERNAL_SERVER_ERROR);
  }
});

// 마이컬렉션 추가 API
router.post('/exhibitions/:exhibition_id/favorite', verifyToken, async (req, res) => {
  try {
      const { email } = req.user;
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const user_id = user.id;
      const exhibition_id = Number(req.query.exhibition_id); // id는 숫자로 변환

      if (isNaN(exhibition_id)) {
        return res.status(400).json({ message: "Invalid exhibition_id" });
      }
  
      // Exhibition 테이블의 id 컬럼과 매칭 확인
      const existingExhibition = await Exhibition.findOne({ where: { id: exhibition_id } });
  
      if (!existingExhibition) {
        return res.status(400).json({ message: "해당 전시는 존재하지 않습니다." });
      }
  
      // FavoriteExhibitions 테이블에서 exhibition_id가 존재하는지 체크
      const existingFavorite = await FavoriteExhibition.findOne({
        where: { user_id, exhibition_id } // exhibition_id가 존재하는지 확인
      });
  
      if (existingFavorite) {
        return res.status(400).json({ message: "이미 마이컬렉션에 추가된 전시입니다." });
      }
  
      // FavoriteExhibitions 테이블에 데이터 삽입
      await FavoriteExhibition.create({
        user_id,
        exhibition_id, // FavoriteExhibitions의 외래 키
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(200).json({ message: "마이컬렉션에 추가되었습니다." });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "서버 오류" });
  }
});

// 마이컬렉션 제거 API
router.delete('/exhibitions/:exhibition_id/favorite', verifyToken, async (req, res) => {
  try {
      const { email } = req.user;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const user_id = user.id;
      const exhibition_id = Number(req.query.exhibition_id); // id를 숫자로 변환

      if (isNaN(exhibition_id)) {
        return res.status(400).json({ message: "Invalid exhibition_id" });
      }

      // FavoriteExhibitions 테이블에서 해당 전시가 존재하는지 체크
      const favorite = await FavoriteExhibition.findOne({ where: { user_id, exhibition_id } });

      if (!favorite) {
          return res.status(404).json({ message: "마이컬렉션에 없는 전시입니다." });
      }

      // 데이터 삭제
      await favorite.destroy();

      return res.status(200).json({ message: "마이컬렉션에서 제거되었습니다." });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "서버 오류" });
  }
});

// 전시 수정 API
router.put('/exhibitions/:id', verifyToken, uploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_date, end_date } = req.body;
    const author_id = req.user.id; // 토큰에서 가져온 사용자 ID

    // 기존 전시 정보 확인
    const exhibition = await Exhibition.findByPk(id);
    if (!exhibition) {
      return res.status(404).json(response(status.NOT_FOUND, "전시를 찾을 수 없습니다."));
    }

    // 사용자가 전시의 소유자인지 확인
    if (exhibition.author_id !== author_id) {
      return res.status(403).json(response(status.FORBIDDEN, "권한이 없습니다."));
    }

    // 업로드된 새 이미지 URL 가져오기 (있다면 업데이트, 없으면 기존 값 유지)
    let image_url = exhibition.image_url; // 기본값은 기존 이미지 URL 유지
    if (req.files && req.files.length > 0) {
      image_url = await uploadImageToS3(req.files[0]); // 새 이미지 업로드
    }

    const updatedExhibition = await Exhibition.updateExhibition(id, { 
      title, 
      image_url,
      start_date,  // 전시 시작일
      end_date  // 전시 마감일
    });

    res.status(200).json({ 
      isSuccess: true,
      code: 200,
      message: "전시가 성공적으로 수정되었습니다.",
      result: updatedExhibition,
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      isSuccess: false,
      code: 500,
      message: "서버 오류입니다.",
      result: null,
     });
  }
});

// 전시 삭제 API
router.delete('/exhibitions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const author_id = req.user.id; // 토큰에서 가져온 사용자 ID

    // 기존 전시 정보 확인
    const exhibition = await Exhibition.findByPk(id);
    if (!exhibition) {
      return res.status(404).json(response(status.NOT_FOUND, "전시를 찾을 수 없습니다."));
    }

    // 사용자가 전시의 소유자인지 확인
    if (exhibition.author_id !== author_id) {
      return res.status(403).json(response(status.FORBIDDEN, "권한이 없습니다."));
    }

    await Exhibition.deleteExhibition(id);

    res.status(200).json({ 
      isSuccess: true,
      code: 200,
      message: "전시가 삭제되었습니다.",
      result: null,
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      isSuccess: false,
      code: 500,
      message: "서버 오류입니다.",
      result: null,
     });
  }
});

// 전시 배경 선택 API
router.get('/exhibitions/backgrounds', async (req, res) => {
  try {
    const backgrounds = [
      { id: 1, name: "갤러리 1", background_url: "https://artne-image.s3.ap-northeast-2.amazonaws.com/Rectangle+143.png" },
      { id: 2, name: "갤러리 2", background_url: "https://artne-image.s3.ap-northeast-2.amazonaws.com/Rectangle+1432.png" },
      { id: 3, name: "갤러리 3", background_url: "https://artne-image.s3.ap-northeast-2.amazonaws.com/Rectangle+1433.png" }
    ]; 

    res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "전시 배경 목록 조회 성공",
      result: backgrounds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      isSuccess: false,
      code: 500,
      message: "서버 오류입니다.",
      result: null,
     });
  }
});

// 전시 등록 시 사용하는 작품 조회 API
router.get('/exhibitions/artworks', verifyToken, async (req, res) => {
  try {
    const author_id = req.user.id; // 토큰에서 사용자 ID 가져오기

    // 해당 작가의 작품 리스트 가져오기
    const artworks = await Artwork.findArtworksByAuthor(author_id);

    if (!artworks || artworks.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        code: 404,
        message: "해당 작가의 작품을 찾을 수 없습니다.",
        result: null,
      });
    }

    // 응답 데이터에서 `thumbnail_image_url`을 `artworks` 배열로 변환
    const formattedArtworks = {
      author_id, // 작가 ID 포함
      artworks: artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artworks: artwork.thumbnail_image_url // 여러 작품을 배열로 저장
      }))
    };

    res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "작품 목록 조회 성공",
      result: formattedArtworks,
    });
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).json({ 
      isSuccess: false,
      code: 500,
      message: "서버 오류입니다.",
      result: null,
     });
  }
});

export default router;