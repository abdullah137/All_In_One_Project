import jwt from 'jsonwebtoken';
import logger from './logger';
import { config } from '../../config/default';

export function signJwt(object: Object, keyName: 'ACCESS_TOKEN_PRIVATE_KEY' | 'REFRESH_TOKEN_PRIVATE_KEY', options?: jwt.SignOptions | undefined) {
    // checking to see if its access token or refresh token

    const signingKey = keyName === 'ACCESS_TOKEN_PRIVATE_KEY' ? config.token.access_token_private_key : config.token.refresh_token_private_key;

    return jwt.sign(object, signingKey, { ...(options && options), algorithm: 'RS256' });
}

export function verifyJwt(token: string, keyName: 'ACCESS_TOKEN_PUBLIC_KEY' | 'REFRESH_TOKEN_PUBLIC_KEY') {
    const publicKey = keyName === 'ACCESS_TOKEN_PUBLIC_KEY' ? config.token.access_token_public_key : config.token.refresh_token_public_key;

    try {
        const decoded = jwt.verify(token, publicKey);

        return {
            valid: true,
            expired: false,
            decoded
        };
    } catch (e: any) {
        return {
            valid: false,
            expired: e.message === 'jwt expired',
            decoded: null
        };
    }
}
