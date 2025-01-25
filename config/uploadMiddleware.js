import upload from './upload.js';
import { BaseError } from './error.js';
import multer from 'multer';
import { response } from './response.js'; 
import { status } from "./response.status.js";

const uploadMiddleware = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer 에러 처리 (파일 크기 초과 등)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json(response(status.UPLOAD_FILE_TOO_LARGE, null));
            } else {
                // 다른 Multer 관련 에러 처리
                return res.status(400).json(response(status.UPLOAD_MULTER_ERROR, null));
            }
        } else if (err) {
            // 일반적인 에러 처리
            return res.status(400).json(response(status.UPLOAD_ERROR, null));
        }
        
        // 업로드가 성공했을 때만 다음 미들웨어로 넘어감
        next();
    });
};

export default uploadMiddleware;
