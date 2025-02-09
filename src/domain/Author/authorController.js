import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Author from './AuthorModel.js';
import User from '../User/UserModel.js';

// 작가 계좌 정보 등록 API
export const updateBankInfo = async (req, res) => {
    try {
        const { bank_name, account_holder, account_number } = req.body;
        const email = req.user.email

        const user = await User.findOne({ where: { email }, attributes: ['id'] });
        if (!user) return sendResponse(res, status.USER_NOT_FOUND);
        const user_id = user.id;
   
        if (!bank_name || !account_holder || !account_number) {
            return sendResponse(res, status.BANK_INFO_NOT_PROVIDED);
        }

        let author = await Author.findOne({ where: { user_id } });

        if (author) {
            await author.update({ bank_name, account_holder, account_number });
        } else {
            author = await Author.create({ user_id, bank_name, account_holder, account_number });
        }
        
        return sendResponse(res, status.SUCCESS, { bank_name, account_holder, account_number });
    } catch (error) {
        console.error('updateBankInfo 에러:', error);
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};

export const getAuthors = async (req, res, next) => {
    try {
      let { sort = 'name', page = 1, limit = 10 } = req.query;
  
      // 정수 변환 및 기본값 설정
      page = parseInt(page, 10);
      limit = parseInt(limit, 10);
  
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
  
      const offset = (page - 1) * limit;
  
      // 정렬 기준 매핑
      const sortOptions = {
        name: ['author_name', 'ASC'],
        recent: ['recent_work_at', 'DESC'],
        popularity: ['popularity', 'DESC']
      };
  
      // 잘못된 정렬 옵션이 들어오면 기본값 적용
      const order = sortOptions[sort] || sortOptions.name;
  
      const { count, rows } = await Author.findAndCountAll({
        attributes: ['author_name', 'id'], // 일단 id만 반환
        order: [order],
        limit,
        offset,
      });

      let authorNameAndCounts = {};
        for (let i = 0; i < rows.length; i++) {
            const author = rows[i];
            const artwork_count = await Author.getArtworkConut(author.id);
            const exhibition_count = await Author.getExhibitionCount(author.id);
            authorNameAndCounts[author.author_name] = {
                artwork_count,
                exhibition_count
            };
        }
  
        return sendResponse(res, status.SUCCESS, {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            authorInfos: authorNameAndCounts
        });
    } catch (error) {
      sendResponse(res, status.BAD_REQUEST);
      next(error);
    }
};

export const updateAuthorInfo = async (req, res) => {
    try {
        const { nickname, birth, address, author_image_url, introduction_image_url } = req.body;
        const email = req.user.email;
   
        if (!nickname && !birth && !address && !author_image_url && !introduction_image_url) {
            throw new Error('EMPTY_VALID_ATTRIBUTE');
        }

        let userData = { email };
        if (nickname) userData.nickname = nickname;
        if (birth) userData.birth = birth;
        if (address) userData.address = address;

        const user = await User.userUpdate(userData);

        let authorData = {};
        if (author_image_url) authorData.author_image_url = author_image_url;
        if (introduction_image_url) authorData.introduction_image_url = introduction_image_url;

        const [author_count] = await Author.updateAuthorByUserId(user.id, authorData);
        if (author_count === 0) {
            throw new Error('AUTHOR_NOT_FOUND');
        }
        
        return sendResponse(res, status.SUCCESS);
    } catch (error) {
        console.error('updateAuthorInfo 에러:', error);
        switch(error.message) {
            case 'EMPTY_VALID_ATTRIBUTE':
                sendResponse(res, status.EMPTY_VALID_ATTRIBUTE);
                break;
            case 'AUTHOR_NOT_FOUND':
                sendResponse(res, status.AUTHOR_NOT_FOUND);
                break;
            default:
                sendResponse(res, status.BAD_REQUEST);
        }
    }
}

export const getAuthorDetail = async (req, res, next) => {
    try {
      const authorId = req.params.authorId;
  
      const author = await Author.findOne({
        where: { id: authorId },
      });

      // return experience, education, award
      const { experience, education, award } = author;

      let responseData = {};

      responseData.artwork_count = await Author.getArtworkConut(authorId);
      responseData.exhibition_count = await Author.getExhibitionCount(authorId);
      responseData.experience = parseTextToArray(experience);
      responseData.education = parseTextToArray(education);
      responseData.award = parseTextToArray(award);

      return sendResponse(res, status.SUCCESS, responseData);
    }
    catch (error) {
        console.error('Error fetching author detail:', error);
        return sendResponse(res, status.AUTHOR_NOT_FOUND);
    }
};


// 작가 프로필 정보 조회 API
export const getAuthorInfo = async (req, res) => {
    try {
        const email = req.user.email
        const user = await User.findOne({ where: { email }, attributes: ['id'] });
        const user_id = user.id;

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
            where: { user_id: user_id },
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

        const email = req.user.email
        const user = await User.findOne({ where: { email }, attributes: ['id'] });
        const user_id = user.id;

        const attribute = req.body.attribute;  
        const value = req.body.value;          

        const allowedAttributes = ['description', 'work_style', 'education', 'award', 'experience'];
        if (!allowedAttributes.includes(attribute)) {
            return sendResponse(res, status.INVALID_ATTRIBUTE, null);
        }

        if (!value) {
            return sendResponse(res, status.PROFILE_INFO_NOT_PROVIDED, null);
        }

        const author = await Author.findOne({ where: { user_id: user_id } });
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