import User from './UserModel.js';
import UserSpace from './UserSpaceModel.js';
import s3 from '../../../config/aws.js';
import { v4 as uuidv4 } from 'uuid';
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import { BaseError } from '../../../config/error.js';
import path from 'path';

// S3 업로드 함수
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
    const files = req.files;

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
      });
    }

    // Multer에서 발생한 파일 크기나 형식 오류 처리
    if (req.fileValidationError) {
      throw new BaseError({
        message: req.fileValidationError,
        code: 'BAD_REQUEST',
      });
    }

    // 유저 조회
    const user = await User.findOne({ where: { email: req.user.email } });

    if (!user) {
      throw new BaseError({
        message: 'User not found.',
        code: 'NOT_FOUND',
      });
    }

    // 이미지 업로드
    const imageUrl = await uploadImageToS3(image);

    // 유저 공간 생성
    const newUserSpace = await UserSpace.create({
      user_id: user.id,
      name,
      image_url: imageUrl,
      area,
    });

    return res.status(status.SUCCESS.status).json(response(status.SUCCESS, { newUserSpace }));
  } catch (error) {
    console.error('Error creating user space:', error);
    if (error instanceof BaseError) {
      return res.status(400).json(response(status.BAD_REQUEST, error.message));
    }
    return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, 'Internal server error.'));
  }
};
