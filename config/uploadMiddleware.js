import upload from './upload.js';
import { BaseError } from './error.js';
import multer from 'multer';
import { response } from './response.js';
import { status } from "./response.status.js";

// 파일 형식 제한 (JPEG, PNG)
const allowedFileTypes = /jpeg|jpg|png/;

// 업로드 미들웨어 (여러 파일 업로드 지원)
const uploadMiddleware = (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => { // 최대 10개 파일 업로드 허용
        if (err instanceof multer.MulterError) {
            // Multer 에러 처리 (파일 크기 초과 등)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json(response(status.UPLOAD_FILE_TOO_LARGE, null));
            } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                console.error('Error Details:', err);
                return res.status(400).json(response(status.UPLOAD_TOO_MANY_FILES, null));
            } else {
                // 다른 Multer 관련 에러 처리
                console.error('Multer Error:', err);
                return res.status(400).json(response(status.UPLOAD_MULTER_ERROR, null));
            }
        } else if (err) {
            // 일반적인 에러 처리
            return res.status(400).json(response(status.UPLOAD_ERROR, null));
        }

        // 파일이 없거나 형식이 잘못된 경우
        if (!req.files || req.files.length === 0) {
            return res.status(400).json(response(status.UPLOAD_NO_FILE, null));
        }

        // 모든 파일 형식 검증
        const invalidFiles = req.files.filter(file => !allowedFileTypes.test(file.mimetype));
        if (invalidFiles.length > 0) {
            return res.status(400).json(response(status.UPLOAD_INVALID_FILE_TYPE, null));
        }

        // 업로드가 성공했을 때만 다음 미들웨어로 넘어감
        next();
    });
};

export default uploadMiddleware;
