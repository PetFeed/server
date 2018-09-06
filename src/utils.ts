import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const { Iamporter, IamporterError } = require('iamporter');

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

export class Card {
	private iamporter;
	constructor() {
		this.iamporter = new Iamporter();
	}

	// iamporter
	// 	.payOnetime({
	// 		merchant_uid: 'merchant_123456789',
	// 		amount: 100,
	// 		card_number: '6210-0381-3311-4382',
	// 		expiry: '2022-04',
	// 		birth: '000601',
	// 		pwd_2digit: '40'
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((err) => {
	// 		if (err instanceof IamporterError) {
	// 			console.log(err);
	// 		}
	// 	});

	// iamporter
	// 	.createSubscription({
	// 		customer_uid: '1234567890',
	// 		card_number: '5365-1003-6311-4386',
	// 		expiry: '2022-11',
	// 		birth: '000105',
	// 		pwd_2digit: '11'
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((err) => {
	// 		if (err instanceof IamporterError) {
	// 			console.log(err);
	// 		}
	// 		// Handle the exception
	//     });

	// iamporter.getSubscription('1234567890').then((result) => {
	// 	console.log(result);
	// });

	// iamporter
	// 	.paySubscription({
	// 		customer_uid: '1234567890',
	// 		merchant_uid: 'merchant_1234123194593943',
	// 		amount: 100
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((err) => {
	// 		if (err instanceof IamporterError) {
	// 			console.log(err);
	// 		}
	// 		// Handle the exception
	// 	});
}
