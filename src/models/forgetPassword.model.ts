import mongoose from 'mongoose';
import { UserDocument } from './user.model';

export interface forgetPasswordInput {
    email: string;
}

export type forgetPasswordType = {
    user: string;
    email: string;
    uf_key: string;
    resetLink: string;
    status: boolean;
};

export interface forgetPasswordDocument extends forgetPasswordInput, mongoose.Document {
    user: UserDocument['_id'];
    uf_key: string;
    resetLink: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const forgetPasswordSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        uf_key: { type: String, required: true },
        resetLink: { type: String, required: true },
        status: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const forgetPasswordModel = mongoose.model<forgetPasswordDocument>('forgetPassword', forgetPasswordSchema);

export default forgetPasswordModel;
