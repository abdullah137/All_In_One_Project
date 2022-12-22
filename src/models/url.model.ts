import mongoose, { Document } from 'mongoose';
import UserModel, { UserDocument } from './user.model';

export interface UrlInput {
    user: UserDocument['_id'];
    long_url: string;
    domain?: string | null;
    title?: string;
    tags?: Array<string>;
}

export interface UrlDocument extends UrlInput, Document {
    createdAt: Date;
    updatedAt: Date;
}

const urlSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        long_url: { type: String, required: true },
        domain: { type: String },
        title: { type: String },
        tags: { type: Array }
    },
    { timestamps: true }
);

const urlModule = mongoose.model<UrlDocument>('Url', urlSchema);

export default UserModel;
