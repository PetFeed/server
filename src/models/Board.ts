import mongoose from "mongoose";
import { UserModel } from "./User";
import { CommentModel } from "./Comment";

export interface BoardtModel extends mongoose.Document {
    createdate: Date;
    contents: string;
    pictures: string[];
    writer: UserModel;
    comments: CommentModel[];
    hash_tags: string[];
    likes: UserModel[];
}

const boardSchema = new mongoose.Schema({
    createdate: { type: Date, default: new Date() },
    contents: { type: String },
    pictures: [{ type: String }],
    writer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    hash_tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const Board: mongoose.Model<BoardtModel> = mongoose.model<BoardtModel>(
    "Board",
    boardSchema
);
export default Board;
