import { Op, Sequelize } from 'sequelize';
import Artwork from '../Artwork/ArtworkModel.js';
import FavoriteArtwork from '../Favorite/FavoriteArtworkModel.js';
import Author from '../Author/AuthorModel.js';
import { response } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';

// 소수점 이하 불필요한 0 삭제
const formatNumber = (num) => {
    const number = Number(num);
    return isNaN(number) ? null : (number % 1 === 0 ? number.toString() : number.toFixed(2).replace(/\.?0+$/, ''));
};

export const getArtworkList = async (req, res) => {
    try {
      const { themes, sizes, forms, sort, page = 1, pageSize = 16 } = req.query;
  
      const whereClause = {};
  
      // 테마 필터
      if (themes) {
        whereClause.theme = { [Op.in]: themes.split(',') }; 
      }
  
      // 크기 필터 (작품 호수 기준)
      if (sizes) {
        const sizeFilters = {
          '1~10호': { [Op.between]: [1, 10] },
          '~30호': { [Op.lte]: 30 },
          '~60호': { [Op.lte]: 60 },
          '~80호': { [Op.lte]: 80 },
          '~100호': { [Op.lte]: 100 },
          '100호 +': { [Op.gt]: 100 },
        };
   
        const sizeArray = sizes.split(',').filter(size => sizeFilters[size]); // 유효한 사이즈만 필터링
        if (sizeArray.length > 0) {
            whereClause.number = { [Op.or]: sizeArray.map(size => sizeFilters[size]) };
        }
      }

      if (forms) {
        const formArray = forms.split(',');
        if (formArray.length > 0) {
          whereClause.form = { [Op.in]: formArray };
        }
      }
  
      // 정렬 옵션 처리
      let order = [];
      if (sort === 'latest') {
        order = [['created_at', 'DESC']];
      } else if (sort === 'popular') {
        order = [[Sequelize.literal('like_count'), 'DESC']]; // 좋아요 수 기준 정렬
      } else {
        order = [Sequelize.literal('RAND()')]; // 랜덤 정렬
      }
  
      // 페이지네이션 계산
      const limit = parseInt(pageSize, 10);
      const offset = (parseInt(page, 10) - 1) * limit;
  
      // DB 조회
      const { count, rows: artworks } = await Artwork.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 
          'title', 
          'thumbnail_image_url',
          'width',
          'height',
          [Sequelize.literal(
            '(SELECT COUNT(*) FROM FavoriteArtworks WHERE FavoriteArtworks.artwork_id = Artwork.id)'
          ), 'like_count'], // 좋아요 개수 추가
          'created_at'
        ],
        include: [
            {
                model: Author,
                as: 'author',
                attributes: ['author_name'],
            }
        ],
        order,
        limit,
        offset,
        distinct: true,  
      }); 

      // size 계산 후 추가
      const artworksWithSize = artworks.map(artwork => ({
          ...artwork.toJSON(),
          size: `${formatNumber(artwork.width)}cm * ${formatNumber(artwork.height)}cm`,
          author_name: artwork.author ? artwork.author.author_name : null, // author_name을 플랫하게 추가
          author: undefined, // author 객체를 제거
      }));

  
      return res.status(200).json(response(status.SUCCESS, {
        total: count,
        page: parseInt(page, 10),
        pageSize: limit,
        artworks: artworksWithSize,
      }));
        
    } catch (error) {
      console.error('Error in getArtworkList:', error);
      return res.status(500).json(response(status.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }
};
