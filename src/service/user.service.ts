import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { omit } from 'lodash';
import UserModel, { UserDocument, UserInput } from '../models/user.model';
import forgetPasswordModel, { forgetPasswordDocument, forgetPasswordType } from '../models/forgetPassword.model';

export async function createUser(input: UserInput) {
    try {
        const user = await UserModel.create(input);

        return omit(user.toJSON(), 'password');
    } catch (e: any) {
        throw new Error(e);
    }
}

export async function findUserByEmail(email: string) {
    try {
        return UserModel.findOne({ email });
    } catch (e: any) {
        throw new Error(e);
    }
}

export async function findUserByUserName(username: string) {
    try {
        return UserModel.findOne({ username });
    } catch (e: any) {
        throw new Error(e);
    }
}

export async function userLogin({ email, password }: { email: string; password: string }) {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
        return false;
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) return false;

    return omit(user.toJSON(), 'password');
}

export async function findUser(query: FilterQuery<UserDocument>) {
    const userInformation = await UserModel.findOne(query).lean();

    return omit(userInformation, 'password');
}

export async function updateProfile(query: FilterQuery<UserDocument>, update: UpdateQuery<UserDocument>, options: QueryOptions) {
    try {
        return UserModel.findOneAndUpdate(query, update, options);
    } catch (e: any) {
        throw new Error(e);
    }
}

export async function findResetLink(query: FilterQuery<forgetPasswordDocument>) {
    try {
        return forgetPasswordModel.findOne(query).lean();
    } catch (e: any) {
        throw new Error(e);
    }
}

export async function createResetLink(info: forgetPasswordType) {
    try {
        return await forgetPasswordModel.create(info);
    } catch (e: any) {
        throw new Error(e);
    }
}

export async function updateResetLink(id: string, link: string) {
    try {
        return await forgetPasswordModel.findByIdAndUpdate(id, {
            $set: {
                resetLink: link
            }
        });
    } catch (e: any) {
        throw new Error(e);
    }
}
