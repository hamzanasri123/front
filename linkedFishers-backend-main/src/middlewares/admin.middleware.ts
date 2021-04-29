import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import userModel from '../models/users.model';

async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    const cookies = req.cookies;
    let token;
    if (cookies && cookies.Authorization) {
        token = cookies.Authorization;
    } else if ('authorization' in req.headers) {
        token = req.headers['authorization'].split(' ')[1];
    } else {
        next(new HttpException(403, 'Authentication token missing'));
        return;
    }
    try {
        const secret = process.env.JWT_SECRET;
        const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;
        const userId = verificationResponse._id;
        const findUser = await userModel.findById(userId);
        if (findUser) {
            if (findUser.role !== 'admin') {
                next(new HttpException(401, 'Unauthorized!'));
            }
            req.user = findUser;
            next();
        } else {
            next(new HttpException(401, 'Wrong authentication token'));
        }
    } catch (error) {
        next(new HttpException(401, 'Wrong authentication token'));
    }

}

export default authMiddleware;
