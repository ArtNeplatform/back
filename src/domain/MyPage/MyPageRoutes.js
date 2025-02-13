import express from 'express';
import MyPage from './MyPageModel.js';
import User from '../User/UserModel.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// 마이페이지 조회 API
router.get('/mypage', verifyToken, async (req, res) => {
    try {
        const email = req.user.email

        // 토큰 오류
        if (!req.user || !req.user.email) {
            return res.status(401).json({
                isSuccess: false,
                code: 401,
                message: "토큰이 제공되지 않았거나 유효하지 않습니다.",
                result: null
            })
        }
        
        // 이메일 기반으로 사용자 정보 조회 (id, role 포함)
        const user = await User.findOne({ where: { email }, attributes: ['id', 'role'] });

        if (!user) { // 사용자가 존재하지 않음
            return res.status(404).json({ isSuccess: false, code: 404, message: "사용자를 찾을 수 없습니다.", result: null });
        }

        const user_id = user.id; // 안전하게 user.id 가져오기
        let myPageData;

        if (user.role === 'BUYER') {
            myPageData = await MyPage.getBuyerMyPage(user_id);
        } else if (user.role === 'AUTHOR') {
            myPageData = await MyPage.getAuthorMyPage(user_id);
        } else { // 잘못된 역할
            return res.status(400).json({ isSuccess: false, code: 400, message: "잘못된 사용자 역할입니다.", result: null });
        }

        res.status(200).json({ isSuccess: true, code: 200, message: "요청에 성공하였습니다.", result: myPageData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ isSuccess: false, code: 500, message: "서버 오류입니다.", result: null });
    }
});

export default router;
