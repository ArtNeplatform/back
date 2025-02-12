//authMiddleware.js
import jwt from 'jsonwebtoken';
import { sendResponse } from '../config/response.js';
import { status } from '../config/response.status.js';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('TOKEN_EMPTY');
            error.statusCode = 401;
            throw error;
        }

        // 토큰 추출
        const token = authHeader.split(' ')[1];
        if (!token) {
            const error = new Error('TOKEN_EMPTY');
            error.statusCode = 401;
            throw error;
        }

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.isComplete === false) {
            const error = new Error('TOKEN_INCOMPLETE');
            error.statusCode = 401;
            throw error;
        }
        req.user = decoded;

        next();
    } catch (error) {
        switch (error.message) {
            case 'TOKEN_EMPTY':
                return sendResponse(res, status.TOKEN_EMPTY);
            case 'TOKEN_INCOMPLETE':
                return sendResponse(res, status.TOKEN_INCOMPLETE);
            default:
                return sendResponse(res, status.TOKEN_INVALID);
        }
    }
};

export const verifyIncompleteToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('TOKEN_EMPTY');
            error.statusCode = 401;
            throw error;
        }

        // 토큰 추출
        const token = authHeader.split(' ')[1];
        if (!token) {
            const error = new Error('TOKEN_EMPTY');
            error.statusCode = 401;
            throw error;
        }

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        switch (error.message) {
            case 'TOKEN_EMPTY':
                return sendResponse(res, status.TOKEN_EMPTY);
            case 'TOKEN_INCOMPLETE':
                return sendResponse(res, status.TOKEN_INCOMPLETE);
            default:
                return sendResponse(res, status.TOKEN_INVALID);
        }
    }
};

//임시토큰발급(삭제예정)
export const getTempTokenByEmail = (req, res, next) => {
    try {
      const { email } = req.params;

      const token = jwt.sign(
        { email }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
      );
      return sendResponse(res, status.SUCCESS, token);

    } catch (error) {
      next(error);
    }
  };
  