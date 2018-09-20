import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import rp, { RequestPromise } from 'request-promise';
// import * as google from 'googleapis';
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

// function getAccessToken() {
// 	return new Promise(function(resolve, reject) {
// 	  var key = require('../serviceAccount');
// 	  var jwtClient = new google.auth.JWT(
// 		key.client_email,
// 		null,
// 		key.private_key,
// 		SCOPES,
// 		null
// 	  );
// 	  jwtClient.authorize(function(err, tokens) {
// 		if (err) {
// 		  reject(err);
// 		  return;
// 		}
// 		resolve(tokens.access_token);
// 	  });
// 	});
//   }

// interface IFCMOption {
// 	registration_ids: string[];
// 	priority: string;
// 	restricted_package_name: string;
// 	data: {
// 		title: string;
// 		body: string;
// 	};
// }
// export class FCM {
// 	private serverKey: string;
// 	private fcmOptions = {
// 		uri: 'fcm.googleapis.com',
// 		port: 443,
// 		path: '/fcm/send',
// 		method: 'POST',
// 		headers: {}
// 	};
// 	constructor(serverKey: string) {
// 		this.serverKey = serverKey;
// 	}
// 	// push_data = {
// 	//     registration_ids : [fcm_token],
// 	//     priority : "high",
// 	//     restricted_package_name : "us.buddman.eyecontractuser",
// 	//     data : {title:"제목", body:"내용"}
// 	// }
// 	send(payload: IFCMOption): RequestPromise {
// 		const mFcmOptions = this.fcmOptions;
// 		const headers = {
// 			Host: mFcmOptions.uri,
// 			Authorization: 'key=' + this.serverKey,
// 			'Content-Type': 'application/json',
// 			'Content-Length': new Buffer(JSON.stringify(payload)).length
// 		};
// 		mFcmOptions.headers = headers;
// 		return rp(mFcmOptions);
// 	}
// }

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
