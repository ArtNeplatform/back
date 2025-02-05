import express from 'express';
import Exhibition from '../models/ExhibitionModel.js'; // Exhibition 모델 불러오기

const router = express.Router();
// 전시 리스트 조회 (페이징 + 정렬 지원)

router.get('/exhibitions', async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'name'; // 기본 정렬: 이름순
    const page = parseInt(req.query.page) || 1; // 기본값: 1
    const limit = parseInt(req.query.limit) || 6; // 기본값: 6

    // 잘못된 정렬 기준 예외 처리
    const validSortOptions = ['name', 'latest', 'popular'];
    if (!validSortOptions.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: `잘못된 정렬 기준입니다. (지원됨: ${validSortOptions.join(', ')})`,
        data: [],
      });
    }

    const { totalItems, totalPages, data } = await Exhibition.getExhibitions(sortBy, page, limit);

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: '전시 데이터를 찾을 수 없습니다.',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: '요청에 성공하였습니다.',
      totalItems,
      totalPages,
      currentPage: page,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      code: 500,
      message: '서버 오류입니다.',
      data: [],
    });
  }
});

// 전시 등록 API
router.post('/exhibitions', async (req, res) => {
  try {
    const { author_id, gallery_id, title, artworks } = req.body;

    // 필수 값 검증
    if (!author_id || !gallery_id || !title || !Array.isArray(artworks)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "author_id, gallery_id, title, artworks 필드는 필수입니다.",
        data: [],
      });
    }

    // 전시 등록
    const exhibition = await Exhibition.createExhibition({ author_id, gallery_id, title, artworks });

    res.status(201).json({
      success: true,
      code: 201,
      message: "요청에 성공하였습니다.",
      data: exhibition,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "서버 오류입니다.",
      data: [],
    });
  }
});


// 전시 상세 조회 API
router.put('/exhibitions/:exhi_id', async (req, res) => {
  try {
    const { exhi_id } = req.params;
    const { title, artworks } = req.body;

    const updatedExhibition = await Exhibition.updateExhibition(exhi_id, { title, artworks });

    // 전시 데이터가 없을 경우
    if (!exhibition) {
        return res.status(404).json({
            success: false,
            code: 404,
            message: "전시를 찾을 수 없습니다.",
            data: []
        });
    }

    res.status(200).json({
      success: true,
      code: 200,
      message: "요청에 성공하였습니다.",
      data: updatedExhibition,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "서버 오류입니다.",
      data: [],
    });
  }
});


// 전시 삭제 API
router.delete('/exhibitions/:exhi_id', async (req, res) => {
  try {
    const { exhi_id } = req.params;

    await Exhibition.deleteExhibition(exhi_id);

    res.status(200).json({
      success: true,
      code: 200,
      message: "요청에 성공하였습니다.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "서버 오류입니다.",
    });
  }
});

export default router;
