export const response = ({isSuccess, code, message}, result) => {
    return {
        isSuccess: isSuccess,
        code: code,
        message: message,
        result: result
    }
};

export const sendResponse = (res, statusObject, result = null) => {
    return res.status(statusObject.status).json({
        isSuccess: statusObject.isSuccess,
        code: statusObject.code,
        message: statusObject.message,
        result: result
    });
};
