import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import User from '../User/UserModel.js';

// 유저 정보 수정 API
export const updateUserInfo = async (req, res) => {
    try {
        const { nickname, birth, address } = req.body;
        const email = req.user.email;
   
        if (!nickname && !birth && !address) {
            return sendResponse(res, status.USER_INFO_NOT_PROVIDED);
        }

        let userData = { email };
        if (nickname) userData.nickname = nickname;
        if (birth) userData.birth = birth;
        if (address) userData.address = address;

        await User.userUpdate(userData);
        
        return sendResponse(res, status.SUCCESS);
    } catch (error) {
        console.error('updateUserInfo 에러:', error);
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};