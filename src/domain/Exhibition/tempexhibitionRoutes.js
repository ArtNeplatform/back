import express from 'express';
import Exhibition from './ExhibitionModel.js'; // Exhibition 모델 불러오기
import Artwork from '../Artwork/Artwork.js';  // 작가의 작품 리스트 가져오기
import uploadMiddleware from '../../../config/uploadMiddleware.js';

const router = express.Router();

// 전시 리스트 조회 API
router.get('/api/exhibitions', async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'name';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const validSortOptions = ['name', 'latest', 'popular'];
    if (!validSortOptions.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `잘못된 정렬 기준입니다. (지원됨: ${validSortOptions.join(', ')})`,
      });
    }

    const { totalItems, totalPages, result } = await Exhibition.getExhibitions(sortBy, page, limit);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: '전시 데이터를 찾을 수 없습니다.' });
    }

    res.status(200).json({ success: true, totalItems, totalPages, currentPage: page, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '서버 오류입니다.' });
  }
});

// 전시 등록 API
router.post('/api/exhibitions', async (req, res) => {
  try {
    const { author_id, title, image_url } = req.body;

    // 필수 필드 검증증
    if (!author_id || !title || !image_url) {
      return res.status(400).json({
        success: false,
        message: "author_id, title, image_url 필드는 필수입니다.",
      });
    }
    
    // 전시 등록
    const exhibition = await Exhibition.createExhibition({ 
      author_id, 
      title, 
      artworks, 
      image_url  // 최종 전시 이미지
    });

    res.status(201).json({ success: true,  message: "전시가 성공적으로 등록되었습니다.", result: exhibition });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류입니다." });
  }
});

// 전시 수정 API
router.put('/api/exhibitions/:id', uploadMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artworks } = req.body;

    // S3에 새로 업로드된 대표 이미지 URL 가져오기
    const image_url = req.files?.[0]?.location || null;

    const updatedExhibition = await Exhibition.updateExhibition(id, { 
      title, 
      image_url
    });

    if (!updatedExhibition) {
      return res.status(404).json({ success: false, message: "전시를 찾을 수 없습니다." });
    }

    res.status(200).json({ success: true, result: updatedExhibition });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류입니다." });
  }
});

// 전시 삭제 API
router.delete('/api/exhibitions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await Exhibition.deleteExhibition(id);

    res.status(200).json({ success: true, message: "전시가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류입니다." });
  }
});

// 전시 배경 선택 API
router.get('/api/exhibitions/backgrounds', async (req, res) => {
  try {
    const backgrounds = [
      { id: 1, name: "갤러리 1", background_url: "https://artne-image.s3.ap-northeast-2.amazonaws.com/Rectangle+143.png" },
      { id: 2, name: "갤러리 2", background_url: "https://artne-image.s3.ap-northeast-2.amazonaws.com/Rectangle+1432.png" },
      { id: 3, name: "갤러리 3", background_url: "https://artne-image.s3.ap-northeast-2.amazonaws.com/Rectangle+1433.png" }
    ]; 

    res.status(200).json({
      success: true,
      message: "전시 배경 목록 조회 성공",
      result: backgrounds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류입니다." });
  }
});

// 전시 등록 시 사용하는 작품 조회 API
router.get('/api/exhibitions/artworks', async (req, res) => {
  try {
    const { author_id } = req.query;

    if (!author_id) {
      return res.status(400).json({
        success: false,
        message: "author_id는 필수입니다."
      });
    }

    // 해당 작가의 작품 리스트 가져오기
    const artworks = await Artwork.findArtworksByAuthor(author_id);

    if (!artworks || artworks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 작가의 작품을 찾을 수 없습니다."
      });
    }

    // 응답 데이터에서 `thumbnail_image_url`을 `artworks` 배열로 변환
    const formattedArtworks = {
      author_id: parseInt(author_id), // 작가 ID 포함
      artworks: artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        artworks: artwork.thumbnail_image_url // 여러 작품을 배열로 저장
      }))
    };

    res.status(200).json({
      success: true,
      message: "작품 목록 조회 성공",
      result: formattedArtworks
    });
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).json({ success: false, message: "서버 오류입니다." });
  }
});


export default router;