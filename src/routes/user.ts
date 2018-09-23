import { Router, Request, Response } from "express";
import multer from "multer";
import { Types } from "mongoose";

import User, { UserModel } from "../models/User";
import { filterMap, getToday } from "../utils";
import Board from "../models/Board";
import { makeFollowLog } from "./log";
import { ifError } from "assert";
import { LogModel } from "../models/Log";

const router = Router();
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "public/images/");
    },
    async filename(req, file, cb) {
        const user = await getUserById(req.user!);
        cb(null, user.nickname + "-" + getToday() + "." + file.mimetype.split("/")[1]);
    }
});
const upload = multer({ storage });

export const getUserById = async (id: string): Promise<UserModel> => {
    const user = await User.findOne({ _id: id }).populate("logs");
    if (user) {
        return user as UserModel;
    } else {
        throw Error("User Not Found!");
    }
};

// 현재 유저 정보 가져오기
router.get("/", async (req, res) => {
    try {
        const user = await getUserById(req.user!);
        res.status(200).json({ success: true, user });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

// 유저 정보 변경
router.patch("/", upload.single("profile"), async function(req, res) {
    const {
        body: { nickname }
    } = req;
    const profile = req.file ? (req.file.filename ? "/images/" + req.file.filename : undefined) : undefined;
    // console.log(req.file, !nickname);
    const update = filterMap({ ...req.body, profile });
    // console.log(filtered);
    try {
        const user = await User.findOneAndUpdate({ _id: req.user }, { $set: update });
        console.log(user);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

// 날 팔로우 한 사람 정보가져오기
router.get("/follwers", async (req, res) => {
    try {
        const user = await getUserById(req.user!).then(user => {
            return User.populate(user, { path: "followers" }) as Promise<UserModel>;
        });
        res.status(200).json({ success: true, data: user.followers });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

// 내가 팔로운 사람 정보 가져오기
router.get("/follwings", async (req, res) => {
    try {
        const user = await getUserById(req.user!).then(user => {
            return User.populate(user, { path: "following" }) as Promise<UserModel>;
        });
        res.status(200).json({ success: true, data: user.following });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

// 팔로우 하기
router.post("/follow", async (req, res) => {
    const {
        body: { to_id }
    } = req;
    try {
        const from_user = await getUserById(req.user!);
        const to_user = await getUserById(to_id);
        from_user.following.push(to_user._id);
        to_user.followers.push(from_user._id);
        await from_user.save();
        await to_user.save();
        makeFollowLog(req.user!!, to_id);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

// 팔로우 취소
router.delete("/follow", async (req, res) => {
    const {
        body: { to_id }
    } = req;
    try {
        const from_user = await getUserById(req.user!);
        const to_user = await getUserById(to_id);
        from_user.following.splice(from_user.following.indexOf(to_user._id), 1);
        to_user.followers.splice(to_user.followers.indexOf(from_user._id), 1);
        await from_user.save();
        await to_user.save();
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

router.get("/boards", async (req, res) => {
    try {
        const boards = await Board.find({ writer: req.user })
            .sort("-createdate")
            .populate("writer")
            .populate("comments")
            .populate({ path: "comments", populate: { path: "writer" } });
        res.status(200).json({ success: true, data: boards });
    } catch (e) {
        res.status(200).json({ success: false, message: e.message });
    }
});

router.get("/notice", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user }).populate({ path: "logs", populate: { path: "from" }, match: { to: { $eq: req.user } } });
        res.status(200).json({ succes: true, data: user });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

router.get("/activity", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user }).populate({ path: "logs", populate: { path: "from" }, match: { from: { $eq: req.user } } });
        res.status(200).json({ succes: true, data: user });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

export default router;
