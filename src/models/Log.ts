import mongoose from 'mongoose';
import { UserModel } from './User';
import { BoardModel } from './Board';
import { CommentModel } from './Comment';

export interface LogModel extends mongoose.Document {
	type: string;
	dataId: string;
	date: Date;
	text: string;
	from: UserModel;
	to: UserModel;
}

const logSchema = new mongoose.Schema({
	type: { type: String, required: true }, // User, Board, Comment
	dataId: { type: String, required: true },
	date: { type: Date, default: new Date() },
	text: { type: String, required: true },
	from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Log: mongoose.Model<LogModel> = mongoose.model<LogModel>('Log', logSchema);
export default Log;

// Log type, date, from, to
// UserLog
