import upload from './upload.js';
import { BaseError } from './error.js';
import multer from 'multer';

const uploadMiddleware = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer 에러 처리 (파일 크기 초과 등)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new BaseError({
                    message: 'File is too large. Maximum allowed size is 10MB.',
                    code: 'BAD_REQUEST',
                }));
            } else {
                // 다른 Multer 관련 에러 처리
                return next(new BaseError({
                    message: `Multer Error: ${err.message}`,
                    code: 'UPLOAD_ERROR',
                }));
            }
        } else if (err) {
            // 일반적인 에러 처리
            return next(new BaseError({
                message: `Unexpected Error: ${err.message}`,
                code: 'UPLOAD_ERROR',
            }));
        }
        
        // 업로드가 성공했을 때만 다음 미들웨어로 넘어감
        next();
    });
};

export default uploadMiddleware;
