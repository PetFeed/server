import { Router, Request, Response } from 'express';
import { sendFcmMessage } from '../utils';
import User, {UserModel} from '../models/User';
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
	try {
		if (from == to) {
			return;
		}
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
			const fromLog = new Log({
				type: 'User',
				dataId: toUser._id,
				text: `회원님이 ${toUser.nickname}을 팔로우했습니다.`,
				fromUser: fromUser._id,
				toUser: toUser._id
			});
			const toLog = new Log({
				type: 'User',
				dataId: fromUser._id,
				text: `${fromUser.nickname}님이 회원님을 팔로우했습니다.`,
				fromUser: fromUser._id,
				toUser: toUser._id
			});
			if(!fromUser._id.equals(toUser._id)) {
				fromUser.logs.push(fromLog);
				await fromUser.save();
				toUser.logs.push(toLog);
				await toUser.save();
				sendFcmMessage(fcmMsg);
			}
		} else {
			throw Error('Log User not found!');
		}
	} catch (e) {
		throw e;
	}
};

// Like Log
export const makeBoardLog = async (from: string, to: string, boardId: string) => {
	try {
		if (from == to) {
			return;
		}
		const fromUser = await User.findOne({ _id: from });
		const toUser = await User.findOne({ _id: to });

		if (fromUser && toUser) {
			const fcmMsg = {
				message: {
					token: toUser.fcm_token,
					data: {
						body: `${fromUser.nickname}님이 회원님의 게시물을 좋아합니다.`,
						title: `PetFeed`
					}
				}
			};
			const fromLog = new Log({
				type: 'Board',
				dataId: boardId,
				text: `회원님이 ${toUser.nickname}의 게시물을 좋아합니다.`,
				fromUser: fromUser._id,
				toUser: toUser._id
			});
			const toLog = new Log({
				type: 'Board',
				dataId: boardId,
				text: `${fromUser.nickname}님이 회원님의 게시물을 좋아합니다.`,
				fromUser: fromUser._id,
				toUser: toUser._id
			});
			if(!fromUser._id.equals(toUser._id)) {
				fromUser.logs.push(fromLog);
				await fromUser.save();
				toUser.logs.push(toLog);
				await toUser.save();
				sendFcmMessage(fcmMsg);
			}
		} else {
			throw Error('Log User not found!');
		}
	} catch (e) {
		throw e;
	}
};

export const makeCommentLog = async (from: string, to: string, commentId) => {
	try {
		if (from == to) {
			return;
		}
		const fromUser = await User.findOne({ _id: from });
		const toUser = await User.findOne({ _id: to });

		if (fromUser && toUser) {
			const fcmMsg = {
				message: {
					token: toUser.fcm_token,
					data: {
						body: `${fromUser.nickname}님이 회원님의 게시물에 댓글을 남겼습니다.`,
						title: `PetFeed`
					}
				}
			};
			const fromLog = new Log({
				type: 'Comment',
				dataId: commentId,
				text: `회원님이 ${toUser.nickname}의 게시물에 댓글을 남겼습니다..`,
				fromUser: fromUser._id,
				toUser: toUser._id
			});
			const toLog = new Log({
				type: 'Comment',
				dataId: commentId,
				text: `${fromUser.nickname}님이 회원님의 게시물에 댓글을 남겼습니다.`,
				fromUser: fromUser._id,
				toUser: toUser._id
			});
			if(!fromUser._id.equals(toUser._id)) {
				fromUser.logs.push(fromLog);
				await fromUser.save();
				toUser.logs.push(toLog);
				await toUser.save();
				sendFcmMessage(fcmMsg);
			}
		} else {
			throw Error('Log User not found!');
		}
	} catch (e) {
		throw e;
	}
};

export const makeReCommentLog = async (from: string, board_owner: string, comment_owner: string, commentId: string) => {
	try {
		const fromUser = await User.findOne({ _id: from }) as UserModel;
		const boardUser = await User.findOne({ _id: board_owner }) as UserModel;
		const commentUser = await User.findOne({ _id: comment_owner }) as UserModel;
		
		if (fromUser && boardUser && commentUser) {
			console.log(` ${fromUser._id}     ${boardUser._id}    ${commentUser._id} `);
			console.log(` ${fromUser._id.equals(boardUser._id)}    ${boardUser._id.equals(commentUser._id)}    ${fromUser._id.equals(commentUser._id)} `);
			console.log(` ${typeof fromUser._id}    ${typeof boardUser._id}   ${typeof commentUser._id} `);
			const boardUserMsg = {
				message: {
					token: boardUser.fcm_token,
					data: {
						body: `회원님의 게시물에 있는 ${commentUser.nickname}님의 댓글에 ${fromUser.nickname}님이 대댓글을 남겼습니다.`,
						title: `PetFeed`
					}
				}
			};
			const commentUserMsg = {
				message: {
					token: commentUser.fcm_token,
					data: {
						body: `${boardUser.nickname}님의 게시물에 있는 회원님의 댓글에 ${fromUser.nickname}님이 대댓글을 남겼습니다.`,
						title: `PetFeed`
					}
				}
			};

			const fromLog = new Log({
				type: 'Comment',
				dataId: commentId,
				text: `회원님이 ${boardUser.nickname}의 게시물에 있는 ${commentUser.nickname}님의 댓글에 대댓글을 남겼습니다..`
				// fromUser: fromUser._id,
				// toUser: toUser._id
			});
			const boardUserLog = new Log({
				type: 'Comment',
				dataId: commentId,
				text: `회원님의 게시물에 있는 ${commentUser.nickname}님의 댓글에 ${fromUser.nickname}님이 대댓글을 남겼습니다.`
				// fromUser: fromUser._id,
				// toUser: toUser._id
			});
			const commentUserLog = new Log({
				type: 'Comment',
				dataId: commentId,
				text: `${boardUser.nickname}님의 게시물에 있는 회원님의 댓글에 ${fromUser.nickname}님이 대댓글을 남겼습니다.`
			});
			
			if(fromUser._id.equals(boardUser._id) && boardUser._id.equals(commentUser._id) && commentUser._id.equals(fromUser._id)) {
				console.log("All same");
				return;
			} else if (fromUser._id.equals(boardUser._id)) {
				console.log("from === board_owner");
				commentUser.logs.push(commentUserLog);
				await commentUser.save();
				sendFcmMessage(commentUserMsg);
				return;
			} else if (fromUser._id.equals(commentUser._id)) {
				console.log("from == comment_owner");
				boardUser.logs.push(boardUserLog);
				await boardUser.save();
				sendFcmMessage(commentUserMsg);
				return;
			} else if (boardUser._id.equals(commentUser._id)) {
				console.log("board_owner == comment_owner");
				boardUserMsg.message.data.body = `회원님의 게시물에 있는 회원님의 댓글에 ${fromUser.nickname}님이 대댓글을 남겼습니다.`;
				const mBoardUserLog = new Log({
					type: 'Comment',
					dataId: commentId,
					text: `회원님의 게시물에 있는 회원님의 댓글에 ${fromUser.nickname}님이 대댓글을 남겼습니다..`
				});
				boardUser.logs.push(mBoardUserLog);
				await boardUser.save();
				sendFcmMessage(commentUserMsg);
				return;
			} else {
				console.log("All deferent");
				fromUser.logs.push(fromLog);
				await fromUser.save();
				boardUser.logs.push(boardUserLog);
				await boardUser.save();
				commentUser.logs.push(commentUserLog);
				await commentUser.save();
				sendFcmMessage(boardUserMsg);
				sendFcmMessage(commentUserMsg);
			}
		} else {
			throw Error('Log User not found!');
		}
	} catch (e) {
		throw e;
	}
};

router.get('/', (req: Request, res: Response) => {});

router.post('/', (req: Request, res: Response) => {});

export default router;
