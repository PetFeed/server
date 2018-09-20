import { Router, Response, Request } from 'express';

import Comment from '../models/Comment';
import Board from '../models/Board';
import { makeCommentLog, makeReCommentLog } from './log';

const router = Router();

const findRoot = async (id: string) => {
	const comment = await Comment.findOne({ _id: id });
	if (!comment) {
		return await Board.findOne({ _id: id }).populate({
			path: 'comments',
			populate: { path: 're_comments' }
		});
	} else {
		return findRoot(comment.parent);
	}
};

router.post('/', async (req: Request, res: Response) => {
	try {
		const { body: { parent, content, type } } = req;
		const comment = new Comment({
			parent,
			writer: req.user,
			content
		});
		await comment.save();
		const board = await findRoot(parent);

		if (type === 're') {
			const pComment = await Comment.findOne({ _id: parent });
			await Comment.findOneAndUpdate({ _id: parent }, { $push: { re_comments: comment._id } });
			makeReCommentLog(req.user!!, board.writer._id, pComment!!.writer as string, comment._id);
		} else {
			await Board.findOneAndUpdate({ _id: parent }, { $push: { comments: comment._id } });
			makeCommentLog(req.user!!, board.writer as string, comment._id);
		}

		// find root
		res.status(200).json({ success: true, data: board });
	} catch (e) {
		res.status(200).json({ success: false, message: e.message });
	}
});
router.get('/:id', async (req, res) => {
	try {
		const board = await findRoot(req.params.id);
		if (board) {
			res.status(200).json({ success: true, data: board });
		} else {
			throw Error('Parents Board not found');
		}
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});
export default router;
