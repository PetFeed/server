import mongoose from 'mongoose';
import { UserModel } from './User';
import { CommentModel } from './Comment';
import { HashTagModel } from './HashTag';

export interface BoardModel extends mongoose.Document {
	createdate: Date;
	contents: string;
	pictures: string[];
	lowPictures: string[];
	writer: UserModel | string;
	comments: CommentModel[] | string[];
	hash_tags: string[] | HashTagModel[];
	likes: UserModel[] | string[];
}

const boardSchema = new mongoose.Schema({
	createdate: { type: Date, default: new Date() },
	contents: { type: String },
	pictures: [ { type: String } ],
	lowPictures: [ { type: String } ],
	writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],
	hash_tags: [ { type: mongoose.Schema.Types.ObjectId, ref: 'HashTag' } ],
	likes: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ]
});

const Board: mongoose.Model<BoardModel> = mongoose.model<BoardModel>('Board', boardSchema);
export default Board;
