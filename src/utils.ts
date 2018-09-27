import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import https from 'https';
// const { Iamporter, IamporterError } = require('iamporter');

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

export const filterMap = (data: object): object => {
	const filtered = Object.keys(data).filter((key) => data[key]).reduce((obj, key) => {
		return {
			...obj,
			[key]: data[key]
		};
	}, {});
	return filtered;
};

export const getToday = (): string => {
	var today = new Date();
	var dd = today.getDate();
	var MM = today.getMonth() + 1; //January is 0!
	var hh = today.getHours();
	var mm = today.getMinutes();

	var yyyy = today.getFullYear();
	return `${yyyy}-${MM < 10 ? '0' + MM : MM}-${dd < 10 ? '0' + dd : dd}-${hh < 10 ? '0' + hh : hh}:${mm < 10
		? '0' + mm
		: mm}`;
};
var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
var SCOPES = [ MESSAGING_SCOPE ];

const getAccessToken = (): Promise<string> => {
	return new Promise((resolve, reject) => {
		var key = require('../serviceAccountKey.json');
		var jwtClient = new google.auth.JWT(key.client_email, undefined, key.private_key, SCOPES, undefined);
		jwtClient.authorize((err, tokens) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(tokens!!.access_token!!);
		});
	});
};

interface IFCMOption {
	message: {
		token: string;
		data: {
			body: string;
			title: string;
		};
	};
}

export async function sendFcmMessage(fcmMessage) {
	const accessToken = await getAccessToken();
	const key = require('../serviceAccountKey.json');
	console.log(accessToken);
	const options = {
		hostname: 'fcm.googleapis.com',
		path: `/v1/projects/${key.project_id}/messages:send`, // ‘/v1/projects/’ + PROJECT_ID + ‘/messages:send’;
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	};

	const request = https.request(options, function(resp) {
		resp.setEncoding('utf8');
		resp.on('data', function(data) {
			console.log(`Message sent to Firebase for delivery, response: ${data}`);
		});
	});
	request.on('error', function(err) {
		console.log(`Unable to send message to Firebase ${err}`);
	});
	request.write(JSON.stringify(fcmMessage));
	request.end();
}

// export class Card {
// 	private iamporter;
// 	constructor() {
// 		this.iamporter = new Iamporter();
// 	}

// 	// iamporter
// 	// 	.payOnetime({
// 	// 		merchant_uid: 'merchant_123456789',
// 	// 		amount: 100,
// 	// 		card_number: '6210-0381-3311-4382',
// 	// 		expiry: '2022-04',
// 	// 		birth: '000601',
// 	// 		pwd_2digit: '40'
// 	// 	})
// 	// 	.then((result) => {
// 	// 		console.log(result);
// 	// 	})
// 	// 	.catch((err) => {
// 	// 		if (err instanceof IamporterError) {
// 	// 			console.log(err);
// 	// 		}
// 	// 	});

// 	// iamporter
// 	// 	.createSubscription({
// 	// 		customer_uid: '1234567890',
// 	// 		card_number: '5365-1003-6311-4386',
// 	// 		expiry: '2022-11',
// 	// 		birth: '000105',
// 	// 		pwd_2digit: '11'
// 	// 	})
// 	// 	.then((result) => {
// 	// 		console.log(result);
// 	// 	})
// 	// 	.catch((err) => {
// 	// 		if (err instanceof IamporterError) {
// 	// 			console.log(err);
// 	// 		}
// 	// 		// Handle the exception
// 	//     });

// 	// iamporter.getSubscription('1234567890').then((result) => {
// 	// 	console.log(result);
// 	// });

// 	// iamporter
// 	// 	.paySubscription({
// 	// 		customer_uid: '1234567890',
// 	// 		merchant_uid: 'merchant_1234123194593943',
// 	// 		amount: 100
// 	// 	})
// 	// 	.then((result) => {
// 	// 		console.log(result);
// 	// 	})
// 	// 	.catch((err) => {
// 	// 		if (err instanceof IamporterError) {
// 	// 			console.log(err);
// 	// 		}
// 	// 		// Handle the exception
// 	// 	});
// }
