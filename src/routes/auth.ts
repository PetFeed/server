import { Request, Response, Router } from 'express';
import User from '../models/User';
import { signJWT } from '../utils';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
	const { body: { user_id, user_pw } } = req;
	try {
		let user = await User.findOne({ user_id });
		if (user) {
			const isValid = await user.comparePW(user_pw);
			if (isValid) {
				user.last_conn = new Date();
				await user.save();
				const token = signJWT({ _id: user._id }, req.app.get('jwt-secret'));
				res.status(200).json({
					success: true,
					token,
					message: 'Login Successfully'
				});
			} else {
				throw Error('Incorrect PW');
			}
		} else {
			throw Error('User Not Found');
		}
	} catch (e) {
		res.status(200).json({ success: false, message: e.message });
	}
});

router.post('/register', async (req: Request, res: Response) => {
	const { body: { user_id, user_pw, nickname, fcm_token } } = req;
	try {
		let user = await User.findOne({ user_id });
		if (!user) {
			user = new User({
				user_id,
				user_pw,
				nickname,
				fcm_token
			});
			user.save();
			res.status(200).json({ success: true, message: 'success', user });
		} else {
			throw Error('Exist User');
		}
	} catch (e) {
		res.status(200).json({ succses: false, message: e.message });
	}
});

export default router;
