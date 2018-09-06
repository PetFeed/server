import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const { Iamporter, IamporterError } = require('iamporter');
var iamporter = new Iamporter();

const app = express();

mongoose.connect('mongodb://localhost:27017/PetFeed', { useNewUrlParser: true }).then(() => {}).catch((err) => {
	console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
});

app.set('port', process.env.PORT || 3000);
app.set('jwt-secret', process.env.JWT_SECRET || 'PETFEEDZZANG');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public/'));

// routes
app.get('/', (req, res) => {
	res.send(`PetFeed server running at ${app.get('port')} port`);
});
import authController from './routes/auth';
app.use('/auth', authController);

app.get('/test', (req, res) => {
	iamporter
		.payOnetime({
			merchant_uid: 'merchant_123456789',
			amount: 100,
			card_number: '6210-0381-3311-4382',
			expiry: '2022-04',
			birth: '000601',
			pwd_2digit: '40'
		})
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			if (err instanceof IamporterError) {
				console.log(err);
			}
		});
});

app.listen(app.get('port'), () => {
	console.log('server running at %d port', app.get('port'));
});
