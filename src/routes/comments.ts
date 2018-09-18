import { Router, Response, Request } from "express";

import Comment from "../models/Comment";
import Board from "../models/Board";

const router = Router();

const findRoot = async (id: string) => {
    const comment = await Comment.findOne({ _id: id });
    if (!comment) {
        return await Board.findOne({ _id: id }).populate({
            path: "comments",
            populate: { path: "re_comments" }
        });
    } else {
        return findRoot(comment.parent);
    }
};

router.post("/", async (req: Request, res: Response) => {
    try {
        const {
            body: { parent, content, type }
        } = req;
        const comment = new Comment({
            parent: parent,
            writer: req.user,
            content
        });
        await comment.save();

        if (type == "re") {
            await Comment.findOneAndUpdate(
                { _id: parent },
                { $push: { re_comments: comment._id } }
            );
        } else {
            await Board.findOneAndUpdate(
                { _id: parent },
                { $push: { comments: comment._id } }
            );
        }

        // find root
        const board = await findRoot(parent);
        res.status(200).json({ success: true, board });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

export default router;
