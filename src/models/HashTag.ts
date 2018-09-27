import mongoose from 'mongoose';
import { BoardModel } from './Board';

export interface HashTagModel extends mongoose.Document {
	tag: string;
	num: number;
	new: number;
}

const hashTagSchema = new mongoose.Schema({
	tag: { type: String, required: true },
	num: { type: Number, default: 0 },
	new: { type: Number, default: 0 }
});

const HashTag: mongoose.Model<HashTagModel> = mongoose.model<HashTagModel>('HashTag', hashTagSchema);
export default HashTag;
