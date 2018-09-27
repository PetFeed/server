import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import sharp from 'sharp';

import Board, { BoardModel } from '../models/Board';
import User from '../models/User';
import { makeBoardLog } from './log';
import HashTag from '../models/HashTag';

const router = Router();
const storage = multer.diskStorage({
	async destination(req, file, cb) {
		const dest = path.join('public/images/temp');
		try {
			await fs.ensureDir(dest);
			cb(null, dest);
		} catch (e) {
			cb(e, dest);
		}
	},
	async filename(req, file, cb) {
		cb(null, file.originalname);
	}
});
const upload = multer({ storage });

router.get('/:id', async (req, res) => {
	const board = await Board.findOne({ _id: req.params.id })
		.populate('writer')
		.populate({ path: 'comments', populate: { path: 're_comments', populate: { path: 'writer' } } })
		.populate({ path: 'comments', populate: { path: 'writer' } })
		.populate({ path: 'hash_tags' });
	res.status(200).json({ success: true, data: board });
});
router.get('/', async (req, res) => {
	const boards = await Board.find({})
		.sort('-createdate')
		.populate('writer')
		.populate({ path: 'comments', populate: { path: 're_comments', populate: { path: 'writer' } } })
		.populate({ path: 'comments', populate: { path: 'writer' } })
		.populate({ path: 'hash_tags' });

	res.status(200).json({ success: true, data: boards });
});
// Create Board
router.post('/', upload.array('pictures'), async (req, res) => {
	try {
		const { body: { contents } } = req;
		let hash_tags;
		console.log(req.body.hash_tags as String[]);
		if (req.body.hash_tags) {
			hash_tags = await Promise.all(
				req.body.hash_tags.map(async (tag) => {
					let tagDB = await HashTag.findOne({ tag });
					if (tagDB) {
						tagDB.new++;
						tagDB.num++;
						await tagDB.save();
						return tagDB._id;
					} else {
						tagDB = new HashTag({
							tag
						});
						tagDB.new++;
						tagDB.num++;
						await tagDB.save();
						return tagDB._id;
					}
				})
			);
		}

		const board = new Board({
			contents,
			hash_tags,
			writer: req.user
		});
		if (req.files) {
			const pendingPaths = (<Express.Multer.File[]>req.files).map(async (file) => {
				const dest = path.resolve('public', 'boards', req.user!, board.id);
				const _path = path.resolve(dest, file.originalname);
				try {
					if (fs.existsSync(dest)) {
						await fs.move(file.path, _path);
					} else {
						await fs.ensureDir(dest);
						await fs.move(file.path, _path);
					}
					return 'boards/' + req.user + '/' + board.id + '/' + file.originalname;
				} catch (e) {
					throw e;
				}
			});
			const paths = await Promise.all(pendingPaths);
			board.pictures = paths;

			const pendigLowPaths = paths.map(async (_path) => {
				const analyze = _path.split('/').reverse();
				const fileName = analyze[0];
				const boardId = analyze[1];
				const userId = analyze[2];
				const filePath = path.resolve('public', 'boards', userId, boardId, fileName);

				const lowFileName = 'low_' + fileName.split('.')[0] + '.webp';
				await sharp(filePath)
					.webp({ quality: 30 })
					.toFile(path.resolve('public', 'boards', userId, boardId, lowFileName));
				return 'boards/' + userId + '/' + boardId + '/' + lowFileName;
			});
			const lowPaths = await Promise.all(pendigLowPaths);
			board.lowPictures = lowPaths;
		}
		await board.save();
		res.status(200).json({ success: true, data: board });
	} catch (e) {
		console.log(e);
		res.status(400).json({ succes: false, message: e.message });
	}
});

// Mod Board
router.patch('/', async (req, res) => {});

// Del Board
router.delete('/', async (req, res) => {
	try {
		await Board.deleteOne({ _id: req.body.board_id });
		res.status(200).json({ success: true });
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});

// Board
router.post('/like', async (req, res) => {
	try {
		const { body: { board_id } } = req;
		const board = await Board.findOne({ _id: board_id })
			.populate('writer')
			.populate({ path: 'comments', populate: { path: 're_comments', populate: { path: 'writer' } } })
			.populate({ path: 'comments', populate: { path: 'writer' } });
		if (board) {
			const idx = (board.likes as string[]).indexOf(req.user!!);
			if (idx < 0) {
				(board.likes as string[]).push(req.user!!);
				makeBoardLog(req.user!!, board.writer as string, board._id);
			} else {
				(board.likes as string[]).splice(idx, 1);
			}
			await board.save();
			res.status(200).json({ success: true, data: board });
		} else {
			throw Error('Board not found');
		}
	} catch (e) {
		res.status(400).json({ success: false, message: e.message });
	}
});

export default router;
