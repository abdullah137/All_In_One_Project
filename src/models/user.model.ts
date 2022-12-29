import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../../config/default';

export interface UserInput {
    email: string;
    username: string;
    password: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<Boolean>;
}

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        username: { type: String, required: true },
        password: { type: String, required: true }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    let user = this as UserDocument;

    if (!user.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(config.token.salt as number);

    const hash = await bcrypt.hashSync(user.password, salt);

    user.password = hash;

    return next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    const user = this as UserDocument;

    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
