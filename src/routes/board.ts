import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

import Board from '../models/Board';
import User from '../models/User';

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
	const board = await Board.findOne({ _id: req.params.id }).populate('writer');
	res.status(200).json({ success: true, data: board });
});
router.get('/', async (req, res) => {
	const boards = await Board.find({}).sort('-createdate').populate('writer');
	res.status(200).json({ success: true, data: boards });
});
// Create Board
router.post('/', upload.array('pictures'), async (req, res) => {
	try {
		const { body: { contents, hash_tags } } = req;

		const board = new Board({
			contents,
			hash_tags,
			writer: req.user
		});

		const pendingPaths = (<Express.Multer.File[]>req.files).map(async (file) => {
			console.log('asdf');
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
		await board.save();
		res.status(200).json({ success: true, data: board });
	} catch (e) {
		res.status(400).json({ succes: false, message: e.message });
	}
});

// Mod Board
router.patch('/', async (req, res) => {});

// Del Board
router.delete('/', async (req, res) => {});

export default router;
