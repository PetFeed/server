import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { getToday, filterMap } from "../utils";

import Board from "../models/Board";
import User from "../models/User";

const router = Router();
var storage = multer.diskStorage({
    destination: async function(req, file, cb) {
        const dest = path.join("public/images/temp");
        try {
            await fs.ensureDir(dest);
            cb(null, dest);
        } catch (e) {
            cb(e, dest);
        }
    },
    filename: async function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });
// Create Board
router.post("/", upload.array("pictures"), async (req, res) => {
    const {
        body: { contents, hash_tags }
    } = req;

    const board = new Board({
        contents,
        hash_tags,
        writer: await User.findOne({ _id: req.user })
    });

    const pendingPaths = (<Express.Multer.File[]>req.files).map(async file => {
        const dest = path.resolve("public", "boards", req.user!, board.id);
        const _path = path.resolve(dest, file.originalname);
        try {
            if (fs.existsSync(dest)) {
                await fs.move(file.path, _path);
            } else {
                await fs.ensureDir(dest);
                await fs.move(file.path, _path);
            }
            return _path;
        } catch (e) {
            throw e;
        }
    });
    const paths = await Promise.all(pendingPaths);
    console.log(paths);
    board.pictures = paths;
    await board.save();
    res.status(200).json(board);
});

// Mod Board
router.patch("/", async (req, res) => {});

// Del Board
router.delete("/", async (req, res) => {});

export default router;
