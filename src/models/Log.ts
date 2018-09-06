import mongoose from 'mongoose';
import { UserModel } from './User';
import { BoardtModel } from './Board';

export interface LogModel extends mongoose.Document {
	board_id: BoardtModel;
	date: Date;
	from: UserModel;
	to: UserModel;
}

const logSchema = new mongoose.Schema({
	board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
	date: { type: Date, default: new Date() },
	from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Log: mongoose.Model<LogModel> = mongoose.model<LogModel>('Log', logSchema);
export default Log;
