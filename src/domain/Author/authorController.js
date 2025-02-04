import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Author from './AuthorModel.js';
import User from '../User/UserModel.js';

// 작가 계좌 정보 등록 API
export const updateBankInfo = async (req, res) => {
    try {
        const { bank_name, account_holder, account_number } = req.body;
        const userId = req.user.userId;
   
        if (!bank_name || !account_holder || !account_number) {
            return sendResponse(res, status.BANK_INFO_NOT_PROVIDED);
        }

        let author = await Author.findOne({ where: { user_id: userId } });

        if (author) {
            await author.update({ bank_name, account_holder, account_number });
        } else {
            author = await Author.create({ user_id: userId, bank_name, account_holder, account_number });
        }
        
        return sendResponse(res, status.SUCCESS, { bank_name, account_holder, account_number });
    } catch (error) {
        console.error('updateBankInfo 에러:', error);
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};


// 작가 프로필 정보 조회 API
export const getAuthorInfo = async (req, res) => {
    try {
        const userId = req.user.userId;
        const type = req.query.type || 'default'; 

        let attributes = [];
        if (type === 'default') {
            attributes = ['author_name', 'author_image_url', 'description', 'work_style', 'education', 'award', 'experience'];
        } else if (type === 'intro') {
            attributes = ['description', 'work_style'];
        } else if (type === 'info') {
            attributes = ['education', 'award', 'experience'];
        }

        const author = await Author.findOne({
            where: { user_id: userId },
            include: [{ model: User, attributes: ['email'] }],
            attributes
        });

        if (!author) {
            return sendResponse(res, status.AUTHOR_NOT_FOUND, null);
        }

        let responseData = {};

        if (type === 'default') {
            responseData.author_name = author.author_name;
            responseData.author_image_url = author.author_image_url;
            responseData.email = author.User?.email;
        }

        if (type === 'default' || type === 'intro') {
            responseData.description = author.description;
            responseData.work_style = author.work_style;
        }
        
        if (type === 'default' || type === 'info') {
            responseData.education = parseTextToArray(author.education);
            responseData.award = parseTextToArray(author.award);
            responseData.experience = parseTextToArray(author.experience);
        }

        return sendResponse(res, status.SUCCESS, responseData);
    } catch (error) {
        console.error('getAuthorInfo 에러:', error);
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};

// 리스트 정보 파싱 (학력, 수상, 경험)
const parseTextToArray = (text) => {
    if (!text) return [];
    return text.split('\n').map((line) => {
        const parts = line.split('|').map(item => item.trim());

        if (parts.length === 2) {
            return { date: parts[0], description: parts[1] };  
        }

        if (parts.length === 4) {
            const [school, major, status, period] = parts;
            const [start_date, end_date] = period.split('~').map(date => date.trim());
            return {
                school,
                major,
                status,
                start_date,
                end_date
            };
        }

        return line;
    });
};

//작가 프로필 정보 수정 API
export const updateAuthorProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const attribute = req.body.attribute;  
        const value = req.body.value;          

        const allowedAttributes = ['description', 'work_style', 'education', 'award', 'experience'];
        if (!allowedAttributes.includes(attribute)) {
            return sendResponse(res, status.INVALID_ATTRIBUTE, null);
        }

        if (!value) {
            return sendResponse(res, status.PROFILE_INFO_NOT_PROVIDED, null);
        }

        const author = await Author.findOne({ where: { user_id: userId } });
        if (!author) {
            return sendResponse(res, status.AUTHOR_NOT_FOUND);
        }

        await author.update({ [attribute]: value });

        return sendResponse(res, status.SUCCESS, {
            attribute:attribute,
            value : value });
    } catch (error) {
        console.error('updateAuthorProfile 에러:', error);
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};