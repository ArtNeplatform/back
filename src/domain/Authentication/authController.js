//authController.js

import axios from 'axios';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../User/UserModel.js';
import Author from '../Author/AuthorModel.js';
import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';

dotenv.config();

const KAKAO_OAUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;

const KAKAO_OAUTH_REDIRECT_URI = (process.env.SERVER_URI || 'http://localhost:5000') + '/auth/oauth/kakao/redirect';
const GOOGLE_OAUTH_REDIRECT_URI = (process.env.SERVER_URI || 'http://localhost:5000') + '/auth/oauth/google/redirect';

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const KAKAO_USERINFO_URL = 'https://kapi.kakao.com/v2/user/me';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:5173';

export const kakaoOAuth = async (req, res, next) => {
    try {
        const is_signup = req.query.signup || false;

        const redirect_uri = KAKAO_OAUTH_REDIRECT_URI + (is_signup ? '/signup' : '/login');

        let url = KAKAO_OAUTH_URL;
        url += `?client_id=${KAKAO_CLIENT_ID}`
        url += `&redirect_uri=${redirect_uri}`
        url += '&response_type=code'
        res.redirect(url);
    }
    catch(error) {
        next(error);
    }
}

export const kakaoOAuthRedirectSignup = async (req, res, next) => {
    try {
        const { code } = req.query;
    
        //redirect to frontend page with qureystring code
        res.redirect(FRONTEND_URI + '/register/redirect?code=' + code + '&social_type=KAKAO');
    }
    catch(error) {
        res.redirect(FRONTEND_URI + '/register/error');
    }
}

export const kakaoOAuthRedirectLogin = async (req, res, next) => {
    try {
        //use login function
        const { code } = req.query;

        //redirect to frontend page with qureystring code
        res.redirect(FRONTEND_URI + '/login/redirect?code=' + code + '&social_type=KAKAO');
    }
    catch(error) {
        res.redirect(FRONTEND_URI + '/login/error');
    }
}

export const googleOAuth = async (req, res, next) => {
    try {
        const is_signup = req.query.signup || false;

        const redirect_uri = GOOGLE_OAUTH_REDIRECT_URI + (is_signup ? '/signup' : '/login');

        let url = GOOGLE_OAUTH_URL;
        url += `?client_id=${GOOGLE_CLIENT_ID}`
        url += `&redirect_uri=${redirect_uri}`
        url += '&response_type=code'
        url += '&scope=email profile'
        res.redirect(url);
    }
    catch(error) {
        next(error);
    }
}

export const googleOAuthRedirectSignup = async (req, res, next) => {
    try{
        const { code } = req.query;

        //redirect to frontend page with qureystring code
        res.redirect(FRONTEND_URI + '/register/redirect?code=' + code + '&social_type=GOOGLE');
    }
    catch(error) {
        res.redirect(FRONTEND_URI + '/register/error');
    }
}

export const googleOAuthRedirectLogin = async (req, res, next) => {
    try {
        const { code } = req.query;

        //redirect to frontend page with qureystring code
        res.redirect(FRONTEND_URI + '/login/redirect?code=' + code + '&social_type=GOOGLE');
    }
    catch(error) {
        res.redirect(FRONTEND_URI + '/login/error');
    }
}

export const signup = async (req, res, next) => {
    try {
        const { code, social_type, role } = req.body;
        console.log(req.body);

        const userInfo = {};
        
        if (social_type === 'GOOGLE') {
            const authInfo = await googleAuthInformationGetter(code, GOOGLE_OAUTH_REDIRECT_URI);
            userInfo.social_id = 'G_' + authInfo.id;
            userInfo.email = authInfo.email;
            userInfo.profile_image_url = authInfo.picture;
        }
        else if (social_type === 'KAKAO') {
            const authInfo = await kakaoAuthInformationGetter(code, KAKAO_OAUTH_REDIRECT_URI);
            const { properties, kakao_account } = authInfo;
            userInfo.social_id = 'K_' + authInfo.id;
            userInfo.email = kakao_account.email;
            userInfo.profile_image_url = properties.profile_image;
        } else {
            throw new Error('INVALID_SOCIAL_TYPE');
        }
        
        Object.assign(userInfo, req.body);

        let user;

        if(role === 'BUYER') {
            user = await User.createUser(userInfo);
        }
        else if(role === 'AUTHOR') {
            user = await User.createUser(userInfo);
            await Author.createAuthor(user);
        }
        else {
            throw new Error('INVALID_ROLE');
        }

        const token = await signToken(userInfo.email);
        sendResponse(res, status.CREATED, { token, userInfo: user });
    }
    catch(error) {
        console.log('회원가입 에러 발생 : ', error); 
        switch(error.message) {
            case 'PROVIDER_API_ERROR':
                sendResponse(res, status.PROVIDER_API_ERROR);
                break;
            case 'INVALID_SOCIAL_TYPE':
                sendResponse(res, status.INVALID_SOCIAL_TYPE);
                break;
            case 'INVALID_ROLE':
                sendResponse(res, status.INVALID_ROLE);
                break;
            case 'EMAIL_ALREADY_EXIST':
                sendResponse(res, status.EMAIL_ALREADY_EXIST);
                break;
            case 'SOCIAL_CODE_ALREADY_EXIST':
                sendResponse(res, status.SOCIAL_CODE_ALREADY_EXIST);
                break;
            default:
                sendResponse(res, status.BAD_REQUEST);
        }
    }
}


export const login = async (req, res, next) => {
    try {
        const { code, social_type } = req.body;
        console.log(req.body);

        const userInfo = {};
        
        if (social_type === 'GOOGLE') {
            const authInfo = await googleAuthInformationGetter(code, GOOGLE_OAUTH_REDIRECT_URI);
            userInfo.social_id = 'G_' + authInfo.id;
            userInfo.email = authInfo.email;
        }
        else if (social_type === 'KAKAO') {
            const authInfo = await kakaoAuthInformationGetter(code, KAKAO_OAUTH_REDIRECT_URI);
            const { properties, kakao_account } = authInfo;
            console.log(properties);
            console.log(kakao_account);
            userInfo.social_id = 'K_' + authInfo.id;
            userInfo.email = kakao_account.email;
        } else {
            throw new Error('INVALID_SOCIAL_TYPE');
        }
        
        const user = await User.findUserByEmail(userInfo.email);

        const token = await signToken(userInfo.email);

        sendResponse(res, status.SUCCESS, { token, userInfo: user });
    }
    catch(error) {
        switch(error.message) {
            case 'PROVIDER_API_ERROR':
                sendResponse(res, status.PROVIDER_API_ERROR);
                break;
            case 'INVALID_SOCIAL_TYPE':
                sendResponse(res, status.INVALID_SOCIAL_TYPE);
                break;
            default:
                sendResponse(res, status.BAD_REQUEST);
        }
    }
}


const googleAuthInformationGetter = async (code, redirectUri) => {
    try{
        const resp = await axios.post(GOOGLE_TOKEN_URL, {
            // x-www-form-urlencoded(body)
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });
        

        const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
            // Request Header에 Authorization 추가
            headers: {
                Authorization: `Bearer ${resp.data.access_token}`,
            },
        });

        return resp2.data;
    } catch(error) {
        console.log(error);
        error.message = 'PROVIDER_API_ERROR';
        throw error;
    }
}

const kakaoAuthInformationGetter = async (code, redirectUri) => {
    try {
        const data = new URLSearchParams({
            code,
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const resp = await axios.post(KAKAO_TOKEN_URL, data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const resp2 = await axios.get(KAKAO_USERINFO_URL, {
            // Request Header에 Authorization 추가
            headers: {
                'Authorization': `Bearer ${resp.data.access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log(resp2.data);

        return resp2.data;
    } catch (error) {
        console.error("Kakao API Error:", error.response ? error.response.data : error.message);
        error.message = 'PROVIDER_API_ERROR';
        throw error;
    }
};

export const signToken = async (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}
