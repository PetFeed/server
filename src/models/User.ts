import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { LogModel } from './Log';

export interface UserModel extends mongoose.Document {
	user_id: string;
	user_pw: string;
	nickname: string;
	last_conn: Date;
	create_date: Date;
	rank: string; // Admin, Premium, General
	profile: string;
	following: UserModel[];
	followers: UserModel[];
	cards: string[];
	logs: LogModel[];
	fcm_token: string;

	comparePW: (pw: string) => boolean;
}

const userSchema = new mongoose.Schema({
	user_id: { type: String, required: true },
	user_pw: { type: String, required: true },
	nickname: { type: String, required: true },
	last_conn: { type: Date, default: Date.now() },
	create_date: { type: Date, default: Date.now() },
	rank: { type: String, default: 'General' },
	profile: { type: String, default: '/images/default.jpg' },
	following: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ], // 날 팔로우 한사람
	followers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ], // 내가 팔로우 한사람
	cards: [ { type: String } ],
	logs: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Log' } ],
	fcm_token: { type: String, required: true }
});

userSchema.pre('save', async function hashPasword(next) {
	try {
		const user = this as UserModel;
		if (!user.isModified('user_pw')) {
			return next();
		}
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(user.user_pw, salt);
		user.user_pw = hash;
		next();
	} catch (e) {
		return next(e);
	}
});

userSchema.methods.comparePW = async function(pw: string) {
	const isMatch: boolean = await bcrypt.compare(pw, this.user_pw);
	return isMatch;
};

const User: mongoose.Model<UserModel> = mongoose.model<UserModel>('User', userSchema);
export default User;
