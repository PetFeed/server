import mongoose from 'mongoose';
import { BoardtModel } from './Board';
import { UserModel } from './User';

export interface CommentModel extends mongoose.Document {
	board_id: BoardtModel;
	writer_id: UserModel;
	content: string;
	re_comments: CommentModel[];
}

const commentSchema = new mongoose.Schema({
	board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
	writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	content: { type: String },
	re_comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ]
});

const Comment: mongoose.Model<CommentModel> = mongoose.model<CommentModel>('Comment', commentSchema);
export default Comment;
