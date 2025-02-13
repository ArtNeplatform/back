import express from 'express';
import Exhibition from './ExhibitionModel.js'; // Exhibition 모델 불러오기
import Artwork from '../Artwork/Artwork.js';  // 작가의 작품 리스트 가져오기
import uploadMiddleware from '../../../config/uploadMiddleware.js';
import s3 from '../../../config/aws.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import { BaseError } from '../../../config/error.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

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
    const sortBy = req.query.sortBy || 'name';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const validSortOptions = ['name', 'latest', 'popular'];
    if (!validSortOptions.includes(sortBy)) {
      return res.status(400).json({
        isSuccess: false,
        code: 400,
        message: `잘못된 정렬 기준입니다. (지원됨: ${validSortOptions.join(', ')})`,
        result: null,
      });
    }

    const { totalItems, totalPages, result } = await Exhibition.getExhibitions(sortBy, page, limit);

    // if (result.length === 0) {
    //   return res.status(404).json({ success: false, message: '전시 데이터를 찾을 수 없습니다.' });
    // }
    if (!result || !Array.isArray(result) || result.length === 0) {
      return res.status(404).json({ 
        isSuccess: false,
        code: 404,
        message: "No exhibitions found",
        result: null,
       });
    }

    res.status(200).json({ 
      isSuccess: true,
      code: 200,
      message: "전시 리스트 조회 성공",
      result: { totalItems, totalPages, currentPage: page, exhibitions: result },
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      isSuccess: false,
      code: 500,
      message: '서버 오류입니다.',
      result: null,
     });
  }
});

// 전시 등록 API
router.post('/exhibitions', verifyToken, uploadMiddleware, async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body;
    const author_id = req.user.id; // 토큰에서 가져온 사용자 ID

    // 업로드된 파일 가져오기
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(response(status.UPLOAD_NO_FILE, "전시 이미지는 필수입니다."));
    }

    // S3에 이미지 업로드
    const image_url = await uploadImageToS3(req.files[0]); // 첫 번째 파일만 업로드

    // 필수 필드 검증
    if (!title || !image_url) {
      return res.status(400).json(response(status.BAD_REQUEST, "title, image_url 필드는 필수입니다."));
    }

    // 전시 등록
    const exhibition = await Exhibition.createExhibition({ 
      author_id, 
      title, 
      image_url, 
      start_date, 
      end_date  
    });

    res.status(201).json({ 
      isSuccess: true,
      code: 201,
      message: "전시가 성공적으로 등록되었습니다.",
      result: exhibition,
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