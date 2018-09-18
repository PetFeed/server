import { Router, Response, Request } from "express";

import Comment from "../models/Comment";
import Board from "../models/Board";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
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
            { $push: { comments: comment._id } },
            { upsert: true, new: true }
        );
    }
    res.status(200).json({ success: true });
});

export default router;
