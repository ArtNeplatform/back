import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import User from '../User/UserModel.js';

// 유저 정보 수정 API
export const updateUserInfo = async (req, res) => {
    try {
        const { nickname, birth, address } = req.body;
        const email = req.user.email;
   
        if (!nickname && !birth && !address) {
            throw new Error('EMPTY_VALID_ATTRIBUTE');
        }

        let userData = { email };
        if (nickname) userData.nickname = nickname;
        if (birth) userData.birth = birth;
        if (address) userData.address = address;

        await User.userUpdate(userData);
        
        return sendResponse(res, status.SUCCESS);
    } catch (error) {
        console.error('updateUserInfo 에러:', error);
        switch(error.message) {
            case 'EMPTY_VALID_ATTRIBUTE':
                sendResponse(res, status.EMPTY_VALID_ATTRIBUTE);
                break;
            default:
                sendResponse(res, status.BAD_REQUEST);
        }
    }
};

// 유저 삭제 API
export const deleteUser = async (req, res) => {
    try {
        const email = req.user.email;
        await User.deleteUser(email);
        
        return sendResponse(res, status.SUCCESS);
    } catch (error) {
        console.error('deleteUser 에러:', error);
        return sendResponse(res, status.MEMBER_NOT_FOUND);
    }
};