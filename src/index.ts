import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';
import fs from 'fs';
import randomstring from 'randomstring';

const { Iamporter, IamporterError } = require('iamporter');
const iamporter = new Iamporter();

import * as utils from './utils';

const app = express();
const log = utils.getToday() + '.log';
console.log(log);
mongoose.connect('mongodb://localhost:27017/PetFeed', { useNewUrlParser: true }).then(() => {}).catch((err) => {
	console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
});

app.set('port', process.env.PORT || 3000);
app.set('jwt-secret', process.env.JWT_SECRET || 'PETFEEDZZANG');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public/'));
// stdout
app.use(morgan(':remote-addr [:date[clf]] ":method :status :url" :response-time ms'));
// log file
app.use(
	morgan(':remote-addr [:date[clf]] ":method :status :url" :response-time ms', {
		stream: fs.createWriteStream('petfeed.log', {
			flags: 'a'
		})
	})
);

// routes
app.get('/', (req, res) => {
	res.send(`PetFeed server running at ${app.get('port')} port`);
});

app.post('/search', async (req, res) => {
	try {
		if (/^#/.exec(req.body.query)) {
			console.log(req.body.query);
			let boards = await Board.find({}).populate({ path: 'hash_tags' });

			// const boards = await Board.find({'hash_tags': {$elemMatch: {tag: req.body.query}}});
			await HashTag.findOneAndUpdate({ tag: req.params.query }, { $inc: { searching: 1 } });
			res.status(200).json({ success: true, data: { boards } });
		} else {
			const users = await User.find({ nickname: { $in: req.body.query } });
			res.status(200).json({ success: true, data: { users } });
		}
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});
app.get('/trend_hashtag', async (req, res) => {
	try {
		const tags = await HashTag.find({}).sort('-new').limit(3);
		res.status(200).json({ success: true, data: { tags } });
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});
app.get('/hashtag', async (req, res) => {
	try {
		HashTag.findRandom({}, {}, { limit: 10 }, async (err, result) => {
			if (err) {
				throw err;
				return;
			}
			const boards = await Promise.all(
				result!!.map(async (tag) => {
					return await Board.findOne({ hash_tags: { $in: tag.id } })
						.populate('hash_tags')
						.populate({ path: 'comments', populate: { path: 're_comments' } });
				})
			);
			res.status(200).json({ success: true, data: { boards: boards } });
		});
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});
app.get('/trend_board', async (req, res) => {
	try {
		// const boards = await Board.find({}).sort({});
		let boards = await Board.aggregate([
			{
				$project: {
					createdate: 1,
					contents: 1,
					pictures: 1,
					lowPictures: 1,
					writer: 1,
					comments: 1,
					hash_tags: 1,
					likes: 1,
					likes_num: { $size: '$likes' }
				}
			},
			{ $sort: { likes_num: -1 } }
		]);
		boards = await Board.populate(boards, [
			{ path: 'writer' },
			{
				path: 'comments',
				populate: [ { path: 'writer' }, { path: 're_comments', populate: { path: 'writer' } } ]
			}
		]);
		const nDate: Date = new Date();

		const fBoards = (boards as BoardModel[]).filter((board) => {
			return (
				board.createdate.valueOf() - nDate.valueOf() > -21599126 &&
				board.createdate.valueOf() - nDate.valueOf() < 0
			);
		});
		res.status(200).json({ success: true, data: fBoards });
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});
app.get('/fcm-test', (req, res) => {
	const fcmMsg = {
		message: {
			token:
				'mcil1iZXkQ:APA91bGIQOYBBMCkZBX9Aj-ybZgAdr_SiYuwNWPp9XBeesYMc57_gbULp4oflHHOmY--YwhtktSzncHvzeRawfyrV3cndNF613DkPHSDgoezJWas-ruxuuRaMLSXRoKd-qdfdfrd-UG8',
			data: {
				body: '왜사냐',
				title: '나인채 병신'
			}
		}
	};
	utils.sendFcmMessage(fcmMsg);
});
import authController from './routes/auth';
import userController from './routes/user';
import boardController from './routes/board';
import commentController from './routes/comments';
import { verifyJWTMiddleware, getToday } from './utils';
import User from './models/User';
import Board, { BoardModel } from './models/Board';
import HashTag from './models/HashTag';
app.use('/auth', authController);
app.use('/user', verifyJWTMiddleware, userController);
app.use('/board', verifyJWTMiddleware, boardController);
app.use('/comment', verifyJWTMiddleware, commentController);

app.post('/card', verifyJWTMiddleware, async (req, res) => {
	const { body: { card_number, expiry, birth, pwd_2digit } } = req;
	iamporter
		.createSubscription({
			customer_uid: req.user!!,
			card_number,
			expiry,
			birth,
			pwd_2digit
		})
		.then((result) => {
			res.status(200).json({ success: true, data: result.data });
		})
		.catch((err) => {
			res.status(400).json({ success: false, message: err.message });
		});
});
app.delete('/card', verifyJWTMiddleware, async (req, res) => {
	try {
		const result = await iamporter.deleteSubscription(req.user!!);
		res.status(200).json({ success: true });
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});
app.post('/pay', verifyJWTMiddleware, async (req, res) => {
	try {
		await iamporter.getSubscription(req.user!!).then();
		const result = await iamporter.paySubscription({
			customer_uid: req.user!!,
			merchant_uid: randomstring.generate(),
			amount: req.body.amount
		});
		console.log(result);
		res.status(200).json({ success: true, data: result });
	} catch (e) {
		res.status(400).json({ success: false, messgae: e.message });
	}
});

app.listen(app.get('port'), () => {
	console.log('server running at %d port', app.get('port'));
});
