import { sendResponse } from '../../../config/response.js';
import { status } from '../../../config/response.status.js';
import Author from './AuthorModel.js';

export const updateBankInfo = async (req, res) => {
    try {
        const { bank_name, account_holder, account_number } = req.body;
        const userId = req.user.userId;

        if (!bank_name || !account_holder || !account_number) {
            return sendResponse(res, status.BANK_INFORMATION_NOT_PROVIDED);
        }

        let author = await Author.findOne({ where: { user_id: userId } });

        if (author) {
            await author.update({ bank_name, account_holder, account_number });
        } else {
            author = await Author.create({ user_id: userId, bank_name, account_holder, account_number });
        }
        
        return sendResponse(res, status.SUCCESS, author);
    } catch (error) {
        return sendResponse(res, status.INTERNAL_SERVER_ERROR);
    }
};
