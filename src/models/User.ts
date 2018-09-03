import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface UserModel extends mongoose.Document {
    user_id: string;
    user_pw: string;
    last_conn: Date;
    create_Date: Date;

    comparePW: (pw: string) => boolean;
}

const userSchema = new mongoose.Schema({
    user_id: String,
    user_pw: String,
    last_conn: { type: Date, default: Date.now() },
    create_Date: { type: Date, default: Date.now() }
});

userSchema.pre("save", async function hashPasword(next) {
    try {
        const user = this as UserModel;
        if (!user.isModified("user_pw")) {
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

const User: mongoose.Model<UserModel> = mongoose.model<UserModel>(
    "User",
    userSchema
);
export default User;
