import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';
import fs from 'fs';

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
// app.get('/fcm-test', (req, res) => {
// 	const fcmMsg = {
// 		message: {
// 			token:
// 				'eBDzitKuLhM:APA91bGKWmbKy7GPqOrmm7NuoKdCJsT6PpPW_UvXWkGBqihhf23AMEQyu-Ktj263OS7d33b7GkPWxZ4UeYPe59u7sk99vbbfPEtZ36gplMx3YJMxHPGhcBuLAkUwsNnxtb4jNLe8eGmX',
// 			data: {
// 				body: '왜사냐',
// 				title: '나인채 병신'
// 			}
// 		}
// 	};
// 	utils.sendFcmMessage(fcmMsg);
// });
import authController from './routes/auth';
import userController from './routes/user';
import boardController from './routes/board';
import commentController from './routes/comments';
import { verifyJWTMiddleware, getToday } from './utils';
app.use('/auth', authController);
app.use('/user', verifyJWTMiddleware, userController);
app.use('/board', verifyJWTMiddleware, boardController);
app.use('/comment', verifyJWTMiddleware, commentController);

app.listen(app.get('port'), () => {
	console.log('server running at %d port', app.get('port'));
});
