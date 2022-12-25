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
    link: string;
    custom_bitlylinks: string[];
    references: object;
    createdAt: Date;
    updatedAt: Date;
}

const urlSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        long_url: { type: String, required: true },
        link: { type: String, required: true },
        custom_bitlylinks: { type: Array },
        domain: { type: String },
        title: { type: String },
        tags: { type: Array }
    },
    { timestamps: true }
);

const urlModel = mongoose.model<UrlDocument>('Url', urlSchema);

export default urlModel;
