import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pick } from 'lodash';
import { TokenExpiredError } from 'jsonwebtoken';
import nodemailer, { SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { createUser, findUser, updateProfile, findUserByUserName, findUserByEmail, findResetLink, createResetLink, updateResetLink } from '../service/user.service';
import { signJwt } from '../utils/jwt';
import logger from '../utils/logger';
import { config } from '../../config/default';
import { createSession, findSessions, updateSession } from '../service/session.service';
import { CreateUserInput, resetPasswordInput, updateUserInput, forgetPasswordInput } from '../schema/user.schema';
import { generateRandomStrings } from '../utils/functions';

export async function createUserHandler(req: Request<{}, {}, CreateUserInput['body']>, res: Response) {
    try {
        // Check if the user already exist
        const checkUserEmail = await findUserByEmail(req.body.email);

        // Check if username already exists
        const checkUserName = await findUserByUserName(req.body.username);

        // For Email Address Checking
        if (checkUserEmail) {
            return res.status(400).json({
                error: 'USER_ALREADY_EXIST',
                status: false,
                msg: 'Sorry, user already exists. Kindly Use A Email Address'
            });
        }

        // For Username Checking
        if (checkUserName) {
            return res.status(400).json({
                error: 'USER_ALREADY_EXIST',
                status: false,
                msg: 'Sorry, user already exists. Kindly Use A New Username'
            });
        }

        // Create User
        const user = await createUser(req.body);

        return res.status(200).json({
            msg: 'USER_CREATED_SUCCESSFULLY',
            status: true,
            user
        });
    } catch (e: any) {
        logger.error(e);
        return res.status(409).json({
            err: 'REQUEST_CONFLICT',
            status: false,
            message: e.message
        });
    }
}

export async function loginUserHandler(req: Request<{}, {}>, res: Response) {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                error: 'USER_NOT_FOUND',
                status: false,
                msg: 'Sorry, no user with that email address'
            });
        }

        // Check for user password
        const isValidCredentials = await user.comparePassword(password);

        if (!isValidCredentials) {
            return res.status(401).json({
                error: 'INVALID_CREDENTIALS',
                status: false,
                msg: 'Sorry, your password is incorrect'
            });
        }

        // Crate a session
        const session = await createSession(user._id, req.get('user-agent') || '');

        const pickObject = pick(user, ['_id', 'email', 'username']);

        // sign a access token
        const accessToken = signJwt({ ...pickObject, session: session._id }, 'ACCESS_TOKEN_PRIVATE_KEY', { expiresIn: config.token.access_token_timeline });

        // sign a refresh token
        const refreshToken = signJwt({ ...pickObject, session: session._id }, 'REFRESH_TOKEN_PRIVATE_KEY', { expiresIn: config.token.refresh_token_timeline });

        return res.status(200).json({
            msg: 'LOGIN_SUCCESSFUL',
            status: true,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (e: any | TokenExpiredError) {
        const tokenExpires = new TokenExpiredError('sorry, the token has expires', new Date());
        if (e.type instanceof TokenExpiredError) {
            return res.status(403).json({
                err: 'TOKEN_EXIRES',
                status: false,
                message: tokenExpires.message
            });
        }
    }
}

export async function getUserSessionsHandler(req: Request, res: Response) {
    const userId = res.locals.user._id;

    const sessions = await findSessions({ user: userId, valid: true });

    return res.status(200).json({
        msg: 'USER_SESSIONS',
        status: 200,
        sessions
    });
}

export async function deleteSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session;

    console.log(sessionId);

    await updateSession({ _id: sessionId }, { valid: false });

    res.locals.user = null;

    return res.status(200).json({
        msg: 'USER_LOGOUT_SUCCESSFULLY',
        status: true,
        accessToken: null,
        refreshToken: null
    });
}

export async function getUserProfile(req: Request, res: Response) {
    const user = res.locals.user;

    const username = user.username;

    try {
        const userInformation = await findUser({ username: username });

        if (userInformation) {
            return res.status(200).json({
                msg: 'QUERY_SUCCESS',
                status: true,
                user: userInformation
            });
        }
    } catch (error: any) {
        logger.error(error);
        return res.status(500).json({
            error: 'INTERNAL_ERROR',
            status: false,
            message: error.message
        });
    }
}

export async function updateUserProfile(req: Request<updateUserInput['params']>, res: Response) {
    const userId = res.locals.user._id;

    const body = req.body;

    try {
        // check if user canditidate exists
        const user = await findUser({ _id: userId });
        if (!user) {
            return res.status(404).json({
                err: 'USER_NOT_EXIST',
                status: false,
                message: 'Sorry, user does not exist.'
            });
        }

        const salt = await bcrypt.genSalt(config.token.salt as number);

        const hash = await bcrypt.hashSync(body.password, salt);

        // check if user email exists
        const checkEmail = await findUserByEmail(body.email);

        if (checkEmail) {
            return res.status(400).json({
                err: 'EMAIL_EXISTS',
                status: false,
                message: 'Sorry, email already exists.'
            });
        }

        const updateUser = await updateProfile({ _id: userId }, { ...body, password: hash }, { new: true });

        if (updateUser) {
            return res.status(200).json({
                query: 'PROFILE_UPDATED_SUCCESSFULLY',
                status: true,
                data: pick(updateUser, ['_id', 'email', 'username'])
            });
        }
    } catch (e: any) {
        return res.status(500).json({
            err: 'INTERNAL_ERROR',
            status: false,
            message: e.message
        });
    }
}

export async function forgetPassword(req: Request<{}, {}, forgetPasswordInput['body']>, res: Response) {
    try {
        // Check if user already
        const checkEmail = await findUserByEmail(req.body.email);

        // For Email Address Checking
        if (!checkEmail) {
            return res.status(404).json({
                error: 'EMAIL_NOT_FOUND',
                status: false,
                message: 'Sorry, that email address does not exist'
            });
        }

        // Generate random string
        const randomString = generateRandomStrings(10);

        const saltRounds: number = config.token.salt as number;
        const tempPassword: number = Math.random() * 1000 + Math.random() * 222;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hashSync(randomString, salt);

        const checkResetPassword = await findResetLink({ email: req.body.email });
        const link = `http://localhost:1337/users/reset-password/${randomString}`;

        const insertBody: { user: string; email: string; uf_key: string; resetLink: string; status: boolean } = {
            user: checkEmail._id,
            email: req.body.email,
            uf_key: hash,
            resetLink: link,
            status: false
        };

        let reset;

        // Checking that password is not equal to null
        if (checkResetPassword?.uf_key != '' && checkResetPassword?.uf_key != null) {
            reset = await updateResetLink(checkResetPassword._id, link);
        } else {
            reset = await createResetLink(insertBody);
        }

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.gmail.username,
                pass: config.gmail.password
            }
        });

        // email options configurations
        let mailOptions: SendMailOptions = {
            to: req.body.email,
            from: 'abdullahyahaya2018@gmail.com',
            subject: 'Reset Passworn on All In One Project',
            html: `Hello ${checkEmail.username}  If you've lost your password or wish to set it. Use the link below to get started. <strong style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
            
            <span style="background-color: #f46a6a;color: #ffffff;padding: 5px 8px; font-size: 12px; border-radius: 4px">${link}</span></strong>
            
              Thanks for choosing <b>Us</b>
            `
        };

        transporter.sendMail(mailOptions, (error: any, info: SMTPTransport.SentMessageInfo) => {
            if (error) {
                return res.status(500).json({
                    err: 'ERR_EMAIL',
                    status: true,
                    message: 'Oops! Something went wrong. Please try again'
                });
            } else {
                return res.status(200).json({
                    msg: 'EMAIL_SENT_ALREADY',
                    status: true,
                    message: 'Email has been sent successfully.'
                });
            }
        });
    } catch (e: any) {
        return res.status(500).json({
            err: 'INTERNAL_ERROR',
            status: false,
            message: e.message
        });
    }
}

export async function resetPassword(req: Request<resetPasswordInput['params']>, res: Response) {
    try {
        // get params id
        const id = req.params.linkId;

        const body = req.body;

        const checkResetLink = await findResetLink({ resetLink: `http://localhost:1337/users/reset-password/${id}` });

        if (!checkResetLink) {
            return res.status(404).json({
                err: 'PAGE_NOT_EXIST',
                status: false,
                message: 'Sorry, the reset link is not available.'
            });
        }

        const salt = await bcrypt.genSalt(config.token.salt as number);

        const hash = await bcrypt.hashSync(body.password, salt);

        const updateUser = await updateProfile({ email: checkResetLink.email }, { password: hash }, { new: true });

        if (updateUser) {
            return res.status(200).json({
                msg: 'QUERY_SUCCESSFUL',
                status: true,
                data: updateUser
            });
        }
    } catch (e: any) {
        return res.status(500).json({
            err: 'INTERNAL_ERROR',
            status: false,
            message: e.messag
        });
    }
}
