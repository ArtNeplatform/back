import express from 'express';
import MyPage from './MyPageModel.js';
import User from '../User/UserModel.js';

const router = express.Router();

// 마이페이지 조회 API
router.get('/mypage/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await User.findOne({ where: { id: user_id }, attributes: ['role'] });

        if (!user) { // 사용자가 존재하지 않음
            return res.status(404).json({ success: false, code: 404, message: "사용자를 찾을 수 없습니다.", data: [] });
        }

        let myPageData;
        if (user.role === 'BUYER') { myPageData = await MyPage.getBuyerMyPage(user_id); }
        else if (user.role === 'AUTHOR') { myPageData = await MyPage.getAuthorMyPage(user_id); }
        else { // 잘못된 역할
            return res.status(400).json({ success: false, code: 400, message: "잘못된 사용자 역할입니다.", data: [] });
        }

        res.status(200).json({ success: true, code: 200, message: "요청에 성공하였습니다.", data: myPageData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, code: 500, message: "서버 오류입니다.", data: [] });
    }
});

export default router;
