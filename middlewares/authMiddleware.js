//authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('유효하지 않은 토큰 형식입니다.');
            error.statusCode = 401;
            throw error;
        }

        // 토큰 추출
        const token = authHeader.split(' ')[1];
        if (!token) {
            const error = new Error('토큰이 제공되지 않았습니다.');
            error.statusCode = 401;
            throw error;
        }

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        if (!error.statusCode) error.statusCode = 401;
        next(error);
    }
};

//임시토큰발급(삭제예정)
export const getTempTokenByUserId = (req, res, next) => {
    try {
      const { userId } = req.params;

      const token = jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
      );
  
      return res.status(200).json({
        success: true,
        token,
      });
    } catch (error) {
      next(error);
    }
  };
  