// jwt 관련 미들웨어 파일
import jwt from "jsonwebtoken"
import { status } from "./response.status.js";
import { response } from "./response.js";

// env
import dotenv from 'dotenv';
// 루트에서 환경변수 불러옴
dotenv.config({ path: "./.env" });
import { JWT_SECRET } from './jwt.js'
const jwtsecret = JWT_SECRET
// const jwtsecret = process.env.JWT_SECRET;

const jwtMiddleware = (req, res, next) => {
    // read the token from header or url
    const token = req.headers['x-access-token'] || req.query.token;
    // token does not exist
    if (!token) {
        return res.send(response(status.TOKEN_EMPTY))
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, jwtsecret, (err, verifiedToken) => {
                if (err) reject(err);
                resolve(verifiedToken)
            })
        }
    );

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        return res.send(response(status.TOKEN_VERIFICATION_FAILURE))
    };
    // process the promise
    p.then((verifiedToken) => {
        //비밀 번호 바뀌었을 때 검증 부분 추가 할 곳
        req.verifiedToken = verifiedToken;
        next();
    }).catch(onError)
};

export default jwtMiddleware;