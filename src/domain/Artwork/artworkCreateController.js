import Artwork from './ArtworkModel.js';  
import ArtworkImage from './ArtworkImageModel.js';
import User from '../User/UserModel.js';
import Author from '../Author/AuthorModel.js';  
import sequelize from '../sequelize.js';  
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import { BaseError } from '../../../config/error.js';
import s3 from '../../../config/aws.js';
import { v4 as uuidv4 } from 'uuid';
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

export const createArtwork = async (req, res) => {
  const transaction = await sequelize.transaction(); 
  try {
    const { theme, form, title, year, genre, material, height, width, number, frame, description, information } = req.body;
    const images = req.files;

    // 필수 데이터 검증
    if (!theme || !form || !images || images.length === 0 || !title) {
      throw new BaseError({
        message: 'Required fields are missing.',
        code: 'BAD_REQUEST',
        details: { theme, form, title, images },
      });
    }

    // Multer에서 발생한 파일 크기나 형식 오류 처리
    if (req.fileValidationError) {
      throw new BaseError({
        message: req.fileValidationError,
        code: 'BAD_REQUEST',
      });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { email: req.user.email } });
    if (!user) {
      throw new BaseError({
        message: 'User not found.',
        code: 'USER_NOT_FOUND',
      });
    }


    // 작가 정보 조회
    const author = await Author.findOne({ where: { user_id: user.id } });
    if (!author) {
      throw new BaseError({
        message: 'Author not found.', // 등록된 작가 정보 없을 때 
        code: 'AUTHOR_NOT_FOUND',
      });
    }

    // 이미지 URL S3 업로드
    const imageUrls = await Promise.all(images.map(uploadImageToS3));
    const thumbnailImageUrl = imageUrls[0]; // 첫 번째 이미지 URL

    // 작품 생성
    const newArtwork = await Artwork.create({
      author_id: author.id,
      theme,
      form,
      thumbnail_image_url: thumbnailImageUrl,
      title,
      year,
      genre,
      material,
      height,
      width,
      number,
      frame,
      description,
      //information,
    }, { transaction });

    // 이미지 데이터 저장
    const artworkImages = imageUrls.map((url) => ({ artwork_id: newArtwork.id, image_url: url }));
    await ArtworkImage.bulkCreate(artworkImages, { transaction });

    await transaction.commit();

    return res.status(status.SUCCESS.status).json(response(status.SUCCESS, { newArtwork, artworkImages }));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof BaseError) {
      console.error('Validation Error:', error.data);
      return res.status(400).json(response(status.BAD_REQUEST, error.message));
    }
    console.error('Unexpected Error:', error);
    return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, null));
  }
};
