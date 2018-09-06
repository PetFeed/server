import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IJWT {
	_id: string;
	iat: number;
	exp: number;
	sub: string;
}

export const verifyJWTMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers['x-access-token'] || req.query.token;

	if (!token) {
		return res.status(403).json({
			message: 'bad request'
		});
	}

	const user = jwt.verify(token, res.app.get('jwt-secret')) as IJWT;
	req.user = user._id;
	next();
};

export const verifyJWT = (token: string, secret: string) => {
	return jwt.verify(token, secret);
};

export const signJWT = (data: object, secret: string) => {
	// console.log(data.toString());
	const token = jwt.sign(data, secret, {
		expiresIn: '7d',
		subject: 'userInfo'
	});
	return token;
};
