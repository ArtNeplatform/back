import multer from 'multer';
import path from 'path';
import { BaseError } from './error.js';

// 파일 저장 위치를 메모리로 설정
const storage = multer.memoryStorage();

// 파일 형식 검증 (이미지 파일만 허용)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (!mimetype || !extname) {
    const error = new BaseError({
        message: 'Only image files are allowed!',
        code: 'BAD_REQUEST',  
    });
    return cb(error, false);  // Multer가 파일 업로드를 거부
  }
  cb(null, true);  // 검증 성공
};

// multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;


/*
[controller 아래 참고]

// S3 업로드 함수(분리 안 한 ver)
const uploadImageToS3 = async (image) => {
  const fileName = uuidv4() + path.extname(image.originalname);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: image.buffer,
    ContentType: image.mimetype,
  };

  const uploadResult = await s3.upload(params).promise();
  if (!uploadResult || !uploadResult.Location) {
    throw new BaseError({
      message: 'Failed to upload image to S3.',
      code: 'UPLOAD_FAILED',
    });
  }
  return uploadResult.Location;
};

export const createUserSpace = async (req, res) => {
  try {
    const { name, area } = req.body;
    const files = req.files; // 업로드된 이미지 파일

    // 다중 파일 업로드 방지
    if (files.length > 1) {
      throw new BaseError({
        message: 'Only one image file is allowed.',
        code: 'BAD_REQUEST',
      });
    }

    const image = files[0]; // 단일 파일 처리

    // 필수 데이터 검증
    if (!name || !area || !image) {
      throw new BaseError({
        message: 'Required fields are missing.',
        code: 'BAD_REQUEST',
        details: { name, area, image },
      });
    }

    // Multer에서 발생한 파일 크기나 형식 오류 처리
    if (req.fileValidationError) {
      throw new BaseError({
        message: req.fileValidationError,
        code: 'BAD_REQUEST',
      });
    }

    // S3에 파일 업로드
    const imageUrl = await uploadImageToS3(image);

    // UserSpace 모델에 공간 정보 저장
    const userSpace = await UserSpace(sequelize).create({
      user_id: req.user.id,
      name,
      area,
      image_url: imageUrl,
    });

    return res.status(status.SUCCESS.status).json(response(status.SUCCESS, userSpace));
  } catch (error) {
    if (error instanceof BaseError) {
      console.error('Validation Error:', error.data);
      return res.status(400).json(response(status.BAD_REQUEST, error.message));
    }
    console.error('Unexpected Error:', error);
    return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, null));
  }
};
*/
