import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const app = express();

mongoose.connect('mongodb://localhost:27017/PetFeed', { useNewUrlParser: true }).then(() => {}).catch((err) => {
	console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
});

app.set('port', process.env.PORT || 3000);
app.set('jwt-secret', process.env.JWT_SECRET || 'PETFEEDZZANG');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public/'));

// routes
app.get('/', (req, res) => {
	res.send(`PetFeed server running at ${app.get('port')} port`);
});
import authController from './routes/auth';
import userController from './routes/user';
import { verifyJWTMiddleware } from './utils';
app.use('/auth', authController);
app.use('/user', verifyJWTMiddleware, userController);

app.listen(app.get('port'), () => {
	console.log('server running at %d port', app.get('port'));
});
