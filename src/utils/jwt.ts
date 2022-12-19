import jwt from 'jsonwebtoken';
import { config } from '../../config/default';

export function signJwt(object: Object, keyName: 'ACCESS_TOKEN_PRIVATE_KEY' | 'REFRESH_TOKEN_PRIVATE_KEY', options?: jwt.SignOptions | undefined) {
    // checking to see if its access token or refresh token
    const signingKey = config.token.access_token_private_key;

    return jwt.sign(object, signingKey, { ...(options && options), algorithm: 'RS256' });
}

export function verifyJwt<T>(token: string, keyName: 'ACCESS_TOKEN_PUBLIC_KEY' | 'REFRESH_TOKEN_PUBLIC_KEY'): T | null {
    const publicKey = Buffer.from(keyName, 'base64').toString('ascii');

    try {
        const decoded = jwt.verify(token, publicKey) as T;

        return decoded;
    } catch (e) {
        return null;
    }
}
