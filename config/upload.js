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
    return cb(new BaseError({
        message: 'Only image files are allowed!',
        code: 'BAD_REQUEST',  
    }), false);  // Multer가 파일 업로드를 거부
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

const image = req.file;
// 파일 이름 고유하게 생성
const fileName = uuidv4() + path.extname(image.originalname);
const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: image.buffer,
    ContentType: image.mimetype,
};

// S3에 파일 업로드
const uploadResult = await s3.upload(params).promise();

if (!uploadResult || !uploadResult.Location) {
    throw new BaseError({
        message: 'Failed to upload image to S3.',
        code: 'UPLOAD_FAILED',
    });
}

// 이미지 URL을 UserSpace 모델에 저장
const userSpace = await UserSpace(sequelize).create({
    user_id: req.user.id, // 로그인된 사용자 ID
    name: name,
    area: area,
    image_url: uploadResult.Location, // S3에서 반환된 이미지 URL
});

return res.status(status.SUCCESS.status).json(response(status.SUCCESS, userSpace));
*/
