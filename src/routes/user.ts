import { Router, Request, Response } from 'express';
import User from '../models/User';
const router = Router();

export const getUserById = async (id: string) => {
	return await User.findOne({ _id: id });
};

export default router;
