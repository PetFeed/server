import { Router, Request, Response } from 'express';
import { sendFcmMessage } from '../utils';
import User from '../models/User';
import Log from '../models/Log';

const router = Router();

// 	const fcmMsg = {
// 		message: {
// 			token:
// 				'eBDzitKuLhM:APA91bGKWmbKy7GPqOrmm7NuoKdCJsT6PpPW_UvXWkGBqihhf23AMEQyu-Ktj263OS7d33b7GkPWxZ4UeYPe59u7sk99vbbfPEtZ36gplMx3YJMxHPGhcBuLAkUwsNnxtb4jNLe8eGmX',
// 			data: {
// 				body: '왜사냐',
// 				title: '나인채 병신'
// 			}
// 		}
// 	};

export const makeFollowLog = async (from: string, to: string) => {
	const fromUser = await User.findOne({ _id: from });
	const toUser = await User.findOne({ _id: to });

	if (fromUser && toUser) {
		const fcmMsg = {
			message: {
				token: toUser.fcm_token,
				data: {
					body: `${fromUser.nickname}님이 회원님을 팔로우했습니다.`,
					title: `PetFeed`
				}
			}
		};
		const fromLog = new Log({});
		sendFcmMessage(fcmMsg);
	} else {
		throw Error('Log User not found!');
	}
};

router.get('/', (req: Request, res: Response) => {});

router.post('/', (req: Request, res: Response) => {});

export default router;
