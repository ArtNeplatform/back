//authController.js

import axios from 'axios';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../User/UserModel.js';
import { urlencoded } from 'express';

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


export const kakaoOAuth = async (req, res, next) => {
    try {
        let url = KAKAO_OAUTH_URL;
        url += `?client_id=${KAKAO_CLIENT_ID}`
        url += `&redirect_uri=${KAKAO_OAUTH_REDIRECT_URI}`
        url += '&response_type=code'
        res.redirect(url);
    }
    catch(error) {
        next(error);
    }
}

export const kakaoOAuthRedirect = async (req, res, next) => {
    try {
        const { code } = req.query;
    
        res.status(200).json({
            social_type: 'KAKAO',
            code: code,
        })
    }
    catch(error) {
        next(error);
    }
}

export const googleOAuth = async (req, res, next) => {
    try {
        let url = GOOGLE_OAUTH_URL;
        url += `?client_id=${GOOGLE_CLIENT_ID}`
        url += `&redirect_uri=${GOOGLE_OAUTH_REDIRECT_URI}`
        url += '&response_type=code'
        url += '&scope=email profile'
        res.redirect(url);
    }
    catch(error) {
        next(error);
    }
}

export const googleOAuthRedirect = async (req, res, next) => {
    try{
        const { code } = req.query;

        res.status(200).json({
            social_type: 'GOOGLE',
            code: code,
        })
    }
    catch(error) {
        next(error);
    }
}

export const signup = async (req, res, next) => {
    try {
        const { code, social_type } = req.body;
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
            throw new Error('Invalid social_type');
        }
        
        Object.assign(userInfo, req.body);

        const user = await User.createUser(userInfo);

        const token = await signToken(userInfo.email);

        res.status(201).json({
            token: token,
            userInfo: user,
        });

    }
    catch(error) {
        next(error);
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
            throw new Error('Invalid social_type');
        }
        
        const user = await User.findUserByEmail(userInfo.email);

        const token = await signToken(userInfo.email);

        res.status(201).json({
            token: token,
            userInfo: user,
        });

    }
    catch(error) {
        next(error);
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
        throw error;
    }
};

export const signToken = async (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}
