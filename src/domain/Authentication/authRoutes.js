import express from 'express';

import * as authController from './authController.js';
import { verifyIncompleteToken } from '../../../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.get('/oauth/kakao', authController.kakaoOAuth);
authRouter.get('/oauth/kakao/redirect', authController.kakaoOAuthRedirectLogin);
authRouter.get('/oauth/kakao/redirect/signup', authController.kakaoOAuthRedirectSignup);
authRouter.get('/oauth/google', authController.googleOAuth);
authRouter.get('/oauth/google/redirect', authController.googleOAuthRedirectLogin);
authRouter.get('/oauth/google/redirect/signup', authController.googleOAuthRedirectSignup);
authRouter.post('/signup', authController.signup);
authRouter.post('/login', authController.login);
authRouter.post('/completion', verifyIncompleteToken, authController.completion);

export default authRouter;