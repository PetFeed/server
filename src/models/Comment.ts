import mongoose from "mongoose";
import { BoardModel } from "./Board";
import { UserModel } from "./User";

export interface CommentModel extends mongoose.Document {
    parent: BoardModel;
    writer: UserModel;
    contents: string;
    re_comments: CommentModel[];
}

const commentSchema = new mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
    writer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contents: { type: String },
    re_comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

const Comment: mongoose.Model<CommentModel> = mongoose.model<CommentModel>(
    "Comment",
    commentSchema
);
export default Comment;
