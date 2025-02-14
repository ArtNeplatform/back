import { StatusCodes } from "http-status-codes";

export const status = {
    // success
    SUCCESS: {status: StatusCodes.OK, "isSuccess": true, "code": 2000, "message": "success!"},
    CREATED: {status: StatusCodes.CREATED, "isSuccess": true, "code": 2010, "message": "created!"},

    // error
    // common err
    INTERNAL_SERVER_ERROR: {status: StatusCodes.INTERNAL_SERVER_ERROR, "isSuccess": false, "code": "COMMON000", "message": "서버 에러, 관리자에게 문의 바랍니다." },
    BAD_REQUEST: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "COMMON001", "message": "잘못된 요청입니다." },
    UNAUTHORIZED: {status: StatusCodes.UNAUTHORIZED, "isSuccess": false, "code": "COMMON002", "message": "권한이 잘못되었습니다." },
    METHOD_NOT_ALLOWED: {status: StatusCodes.METHOD_NOT_ALLOWED, "isSuccess": false, "code": "COMMON003", "message": "지원하지 않는 Http Method 입니다." },
    FORBIDDEN: {status: StatusCodes.FORBIDDEN, "isSuccess": false, "code": "COMMON004", "message": "금지된 요청입니다." },
    NOT_FOUND: {status: StatusCodes.NOT_FOUND, "isSuccess": false, "code": "COMMON005", "message": "요청한 페이지를 찾을 수 없습니다. 관리자에게 문의 바랍니다." },
    EMPTY_VALID_ATTRIBUTE: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "COMMON006", "message": "유효한 속성이 존재하지 않습니다." },

    // member err
    MEMBER_NOT_FOUND: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "MEMBER4001", "message": "사용자가 없습니다."},
    NICKNAME_NOT_EXIST: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "MEMBER4002", "message": "닉네임은 필수입니다."},
    EMAIL_ALREADY_EXIST: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "MEMBER4003", "message": "이미 가입된 이메일이 존재합니다."},
    SOCIAL_CODE_ALREADY_EXIST: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "MEMBER4004", "message": "이미 가입된 소셜 코드가 존재합니다."},

    // db error
    PARAMETER_IS_WRONG: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "DATABASE4001", "message": "쿼리 실행 시 전달되는 파라미터가 잘못되었습니다. 파라미터 개수 혹은 파라미터 형식을 확인해주세요."},

    // article err
    ARTICLE_NOT_FOUND: {status: StatusCodes.NOT_FOUND, "isSuccess": false, "code": "ARTICLE4001", "message": "게시글이 없습니다."},

     // author err
    BANK_INFO_NOT_PROVIDED: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "AUTHOR4001", "message": "계좌 등록 정보가 제공되지 않았습니다."},
    AUTHOR_NOT_FOUND: {status: StatusCodes.NOT_FOUND, "isSuccess": false, "code": "AUTHOR4002", "message": "작가 정보가 없습니다."},
    PROFILE_INFO_NOT_PROVIDED: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "AUTHOR4003", "message": "프로필 등록 정보가 제공되지 않았습니다."},
    INVALID_ATTRIBUTE: {status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "AUTHOR4004", "message": "유효하지 않은 속성입니다."},


    // artwork err
    ARTWORK_NOT_FOUND: {status: StatusCodes.NOT_FOUND, "isSuccess": false, "code": "ARTWORK4001", "message": "작품이 없습니다."},

    // auction err
    AUCTION_ALREADY_ONGOING: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUCTION4001', message: '이미 진행 중인 경매가 있습니다.' },
    INVALID_END_TIME: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUCTION4002', message: '잘못된 마감 시간 입니다.' },
    AUCTION_ALREADY_COMPLETED: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUCTION4003', message: '이미 완료된 경매입니다..' },
    AUCTION_NOT_FOUND: { status: StatusCodes.NOT_FOUND, isSuccess: false, code: 'AUCTION4004', message: '해당 경매가 없습니다.' },
    BID_LOWER_THAN_CURRENT_PRICE: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUCTION4005', message: '입찰가가 현재가보다 낮습니다.' },
    BID_LOWER_THAN_START_PRICE: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUCTION4006', message: '입찰가가 시작가보다 낮습니다.' },
    CANNOT_BID_OWN_AUCTION:  { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUCTION4007', message: '경매 등록자는 입찰 할 수 없습니다.' },
    AUCTION_ALREADY_FAVORITED: {status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUCTION4008', message: '이미 좋아요한 경매입니다.' },
    
    //exhibition err
    EXHIBITION_NOT_FOUND: {status: StatusCodes.NOT_FOUND, "isSuccess": false, "code": "EXHIBITION4001", "message": "전시가 없습니다."},

    // oauth provider err
    PROVIDER_API_ERROR: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUTH4001', message: 'OAUTH 프로바이더 API 에러' },
    // authentication err
    INVALID_SOCIAL_TYPE: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUTH4002', message: '유효하지 않은 프로바이더 소셜 타입' },
    INVALID_ROLE: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'AUTH4003', message: '유효하지 않은 계정 역할' },
    TOKEN_INVALID : {status: StatusCodes.UNAUTHORIZED, "isSuccess": false, "code": "AUTH4004", "message": "유효하지 않은 토큰입니다" },
    TOKEN_EMPTY : {status: StatusCodes.UNAUTHORIZED, "isSuccess": false, "code": "AUTH4005", "message": "토큰이 제공되지 않았습니다" },

    // payment err
    PAYMENT_NOT_FOUND: { status: StatusCodes.NOT_FOUND, isSuccess: false, code: 'PAYMENT4001', message: '해당 결제가 없습니다.' },
    PAYMENT_ALREADY_COMPLETED: { status: StatusCodes.BAD_REQUEST, isSuccess: false, code: 'PAYMENT4002', message: '이미 완료된 결제입니다.' },

    // upload error
    UPLOAD_MULTER_ERROR: { status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "UPLOAD4001", "message": "파일 업로드 중 Multer 오류가 발생했습니다." }, 
    UPLOAD_ERROR: { status: StatusCodes.BAD_REQUEST, "isSuccess": false, "code": "UPLOAD4002", "message": "파일 업로드 중 오류가 발생했습니다." },
    UPLOAD_FILE_TOO_LARGE: {status: StatusCodes.BAD_REQUEST,"isSuccess": false,"code": "UPLOAD4003","message": "파일 크기가 너무 큽니다. 최대 허용 크기는 10MB입니다"},
    UPLOAD_TOO_MANY_FILES: {status: StatusCodes.BAD_REQUEST,"isSuccess": false,"code": "UPLOAD4004","message": "최대 10개 파일 업로드 가능합니다."},
    UPLOAD_NO_FILE: {status: StatusCodes.BAD_REQUEST,"isSuccess": false,"code": "UPLOAD4004","message": "업로드된 파일이 없습니다."},
    UPLOAD_INVALID_FILE_TYPE: {status: StatusCodes.BAD_REQUEST,"isSuccess": false,"code": "UPLOAD4004","message": "업로드된 파일 형식이 잘못되었습니다다."},

}
