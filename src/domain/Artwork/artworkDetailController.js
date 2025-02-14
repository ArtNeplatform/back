import Artwork from './ArtworkModel.js';
import Author from '../Author/AuthorModel.js';
import ArtworkImage from './ArtworkImageModel.js';
import Exhibition from '../Exhibition/ExhibitionModel.js';
import UserSpace from '../User/UserSpaceModel.js';
import { Op } from 'sequelize';
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Users from '../User/UserModel.js';

// 소수점 이하 불필요한 0 삭제
const formatNumber = (num) => {
  const number = Number(num);
  return isNaN(number) ? null : (number % 1 === 0 ? number.toString() : number.toFixed(2).replace(/\.?0+$/, ''));
};

export const getArtworkDetails = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const user = req.user;

    if (!artworkId) {
      return res.status(400).json(response(status.BAD_REQUEST, 'Artwork ID is required.'));
    }

    // 작품 정보 조회
    const artworkPromise = Artwork.findOne({
      where: { id: artworkId },
      attributes: { exclude: ["updated_at"] },
      include: [
        { model: Author, as: 'author', attributes: ['id', 'author_name', 'author_image_url', 'work_style'] },
      ],
    });

    // 사용자 정보 조회
    let userSpacesPromise = [];
    if (user?.email) {
      userSpacesPromise = Users.findOne({ where: { email: user.email } })
        .then((foundUser) => foundUser ? UserSpace.findAll({
          where: { user_id: foundUser.id },
          attributes: ['id', 'name', 'image_url', 'area'],
        }) : []);
    }

    // 작품과 작가 정보 조회
    const [artwork, userSpaces] = await Promise.all([artworkPromise, userSpacesPromise]);

    if (!artwork) {
      console.error(`Artwork not found. artworkId: ${artworkId}`);
      return res.status(404).json(response(status.NOT_FOUND, 'Artwork not found.'));
    }

    const author = artwork?.author || null;

    // 작품의 작가 ID를 가져와서 해당 작가의 작품 수와 전시 수를 계산
    const artworkCount = await Artwork.count({ where: { author_id: author?.id } });
    const exhibitionCount = await Exhibition.count({ where: { author_id: author?.id } });

    // ArtworkImage에서 해당 artworkId에 맞는 이미지들 가져오기
    const artworkImages = await ArtworkImage.findAll({
      where: { artwork_id: artworkId },
      attributes: ['image_url'],
    });

    // 작품의 thumbnail_image_url을 artwork_image에 포함
    const artworkImageUrls = [artwork.thumbnail_image_url, ...artworkImages.map((image) => image.image_url)];

    const responseData = {
      fixed_info: {  
        author_name: author?.author_name || 'Unknown',  
        artwork_title: artwork.title,  
        artwork_image: artworkImageUrls,  // thumbnail_image_url과 ArtworkImage의 image_url 포함
        year: artwork.year,
        dimensions: `${formatNumber(artwork.height)} x ${formatNumber(artwork.width)} cm`,
        material: artwork.material,
        size: artwork.number,
        category: artwork.theme,
        genre: artwork.genre,
      },
      tab_data: {  
        description: artwork.description,
        userspace: userSpaces.length > 0 ? userSpaces.map((space) => ({  
          userspace_id: space.id,
          name: space.name,
          image_url: space.image_url,
          area: space.area,
        })) : [],
        author_id: author?.id, 
        author_name: author?.author_name,  
        author_image: author?.author_image_url,
        work_style: author?.work_style, 
        artwork_count: artworkCount, 
        exhibition_count: exhibitionCount,  
        other_artworks: artwork.author ? await Artwork.findAll({
          where: { author_id: artwork.author.id, id: { [Op.ne]: artworkId } },
          attributes: ['id', 'title', 'thumbnail_image_url'],
        }).then((otherArtworks) => otherArtworks.map((item) => ({
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnail_image_url,
        }))) : [],
      },
    };

    return res.status(status.SUCCESS.status).json(response(status.SUCCESS, responseData));
  } catch (error) {
    console.error('Error in getArtworkDetails:', error);
    return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, 'Internal server error.'));
  }
};
