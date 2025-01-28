import express from 'express';

import * as authController from './authController.js';

const authRouter = express.Router();

authRouter.get('/oauth/kakao', authController.kakaoOAuth);
authRouter.get('/oauth/kakao/redirect', authController.kakaoOAuthRedirect);
authRouter.get('/oauth/google', authController.googleOAuth);
authRouter.get('/oauth/google/redirect', authController.googleOAuthRedirect);
authRouter.post('/signup', authController.signup);
authRouter.post('/login', authController.login);

export default authRouter;