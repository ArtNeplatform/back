//PaymentController.js

import axios from 'axios';
import * as dotenv from 'dotenv';
import Payment from './PaymentModel.js';
import Auction from '../Auction/AuctionModel.js';
import Artwork from '../Artwork/ArtworkModel.js';
import User from '../User/UserModel.js';
import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';

dotenv.config();

const KAKAOPAY_PAYMENT_READY_URL = 'https://open-api.kakaopay.com/online/v1/payment/ready';
const KAKAOPAY_PAYMENT_APPROVE_URL = 'https://open-api.kakaopay.com/online/v1/payment/approve';

const KAKAOPAY_SECRET_KEY = process.env.KAKAOPAY_SECRET_KEY_DEV;
const KAKAOPAY_CID = process.env.KAKAOPAY_FRANCHISE_CODE_DEV;

export const kakaoPayReady = async (req, res) => {
    try {

        const payment_id = req.params.payment_id;

        const {
            approval_url,
            fail_url,
            cancel_url
        } = req.body;

        //결제 객체 찾기
        const payment = await Payment.findPaymentById(payment_id);

        if (!payment)
            throw new Error('PAYMENT_NOT_FOUND');

        if(payment.payment_status !== 'PENDING')
            throw new Error('PAYMENT_ALREADY_COMPLETED');
        
        //구매자 찾기
        const buyer = await User.findUserById(payment.user_id);

        if(!buyer)
            throw new Error('MEMBER_NOT_FOUND');

        if(req.user.email !== buyer.email)
            throw new Error('UNAUTHORIZED');

        //경매 찾기
        const auction = await Auction.findAuctionById(payment.auction_id);

        if (!auction) 
            throw new Error('AUCTION_NOT_FOUND');

        //작품 찾기
        const artwork = await Artwork.findArtworkById(auction.artwork_id);

        if (!artwork) 
            throw new Error('ARTWORK_NOT_FOUND');

        //필요 속성 정의
        const item_name = artwork.title;
        const quantity = 1;
        const tax_free_amount = 0;
        const partner_order_id = payment.id;
        const partner_user_id = buyer.id;
        const total_amount = payment.payment_price;

        //통신 시작
        const response = await axios({
            method: 'POST',
            url: KAKAOPAY_PAYMENT_READY_URL,
            headers: {
                'Authorization': `SECRET_KEY ${KAKAOPAY_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                cid: KAKAOPAY_CID || 'TC0ONETIME', // 테스트용 CID
                partner_order_id,
                partner_user_id,
                item_name,
                quantity,
                total_amount,
                tax_free_amount,
                approval_url,
                fail_url,
                cancel_url
            }
        });

        if(response.status !== 200)
            throw new Error('PAYMENT_KAKAOPAY_READY_ERROR');

        // kakaopay_tid 저장
        await Payment.updateKakaoPayTid(payment_id, response.data.tid);

        // 결제 준비 응답 저장
        const paymentData = {
            next_redirect_pc_url: response.data.next_redirect_pc_url,
            next_redirect_mobile_url: response.data.next_redirect_mobile_url,
            next_redirect_app_url: response.data.next_redirect_app_url,
            android_app_scheme: response.data.android_app_scheme,
            ios_app_scheme: response.data.ios_app_scheme,
            created_at: response.data.created_at
        };

        // 성공 응답 반환
        return sendResponse(res, status.SUCCESS, paymentData);

    } catch (error) {
        console.error('KakaoPay Ready Error:', error.response?.data || error.message);
        
        // 에러 처리
        switch (error.message) {
            case 'PAYMENT_NOT_FOUND':
                return sendResponse(res, status.PAYMENT_NOT_FOUND);
            case 'PAYMENT_ALREADY_COMPLETED':
                return sendResponse(res, status.PAYMENT_ALREADY_COMPLETED);
            case 'MEMBER_NOT_FOUND':
                return sendResponse(res, status.MEMBER_NOT_FOUND);
            case 'UNAUTHORIZED':
                return sendResponse(res, status.UNAUTHORIZED);
            case 'AUCTION_NOT_FOUND':
                return sendResponse(res, status.AUCTION_NOT_FOUND);
            case 'ARTWORK_NOT_FOUND':
                return sendResponse(res, status.ARTWORK_NOT_FOUND);
            case 'PAYMENT_KAKAOPAY_READY_ERROR':
                return sendResponse(res, status.PAYMENT_KAKAOPAY_READY_ERROR);
            default:
                return sendResponse(res, status.INTERNAL_SERVER_ERROR);
        }
    }
};

export const kakaoPayApprove = async (req, res) => {
    try {
        const payment_id = req.params.payment_id;
        const { pg_token } = req.body;

        //결제 객체 찾기
        const payment = await Payment.findPaymentById(payment_id);

        if (!payment)
            throw new Error('PAYMENT_NOT_FOUND');

        if (payment.payment_status === 'COMPLETED')
            throw new Error('PAYMENT_ALREADY_COMPLETED');

        const response = await axios({
            method: 'POST',
            url: KAKAOPAY_PAYMENT_APPROVE_URL,
            headers: {
                'Authorization': `SECRET_KEY ${KAKAOPAY_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                cid: KAKAOPAY_CID || 'TC0ONETIME',
                tid: payment.kakaopay_tid,
                partner_order_id: payment.id,
                partner_user_id: payment.user_id,
                pg_token
            }
        });

        if(response.status !== 200)
            throw new Error('KAKAOPAY_APPROVE_ERROR');

        await Payment.updatePaymentStatus(payment_id, 'COMPLETED');

        return sendResponse(res, status.SUCCESS, payment_id);

    } catch (error) {
        console.error('KakaoPay Approve Error:', error.response?.data || error.message);
 
        switch (error.message) {
            case 'PAYMENT_NOT_FOUND':
                return sendResponse(res, status.PAYMENT_NOT_FOUND);
            case 'PAYMENT_ALREADY_COMPLETED':
                return sendResponse(res, status.PAYMENT_ALREADY_COMPLETED);
            case 'KAKAOPAY_APPROVE_ERROR':
                return sendResponse(res, status.PAYMENT_KAKAOPAY_APPROVE_ERROR);
            default:
                return sendResponse(res, status.INTERNAL_SERVER_ERROR);
        }
    }
};