import mongoose from 'mongoose';
import { BoardModel } from './Board';
import { UserModel } from './User';

export interface CommentModel extends mongoose.Document {
	parent: string;
	writer: UserModel;
	content: string;
	re_comments: CommentModel[];
	create_date: Date;
}

const commentSchema = new mongoose.Schema({
	parent: { type: String, required: true },
	writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	content: { type: String },
	re_comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],
	create_date: { type: Date, default: new Date() }
});

const Comment: mongoose.Model<CommentModel> = mongoose.model<CommentModel>('Comment', commentSchema);
export default Comment;
