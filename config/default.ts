import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.xbjva.mongodb.net/all_in_one`;

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337;

const SALT_WORK_FACTOR = process.env.SALTWORKFACTOR ? Number(process.env.SALTWORKFACTOR) : '';
const ACCESS_TOKEN_PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY ? String(process.env.ACCESS_TOKEN_PRIVATE_KEY) : '';
const ACCESS_TOKEN_PUBLIC_KEY = process.env.ACCESS_TOKEN_PUBLIC_KEY ? String(process.env.ACCESS_TOKEN_PUBLIC_KEY) : '';
const REFRESH_TOKEN_PRIVATE_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY ? String(process.env.REFRESH_TOKEN_PRIVATE_KEY) : '';
const REFRESH_TOKEN_PUBLIC_KEY = process.env.REFRESH_TOKEN_PUBLIC_KEY ? String(process.env.REFRESH_TOKEN_PUBLIC_KEY) : '';
const ACCESS_TOKEN_TIMELINE = process.env.ACCESS_TOKEN_TIMELINE ? String(process.env.ACCESS_TOKEN_TIMELINE) : '';
const REFRESH_TOKEN_TIMELINE = process.env.REFRESH_TOKEN_TIMELINE ? String(process.env.REFRESH_TOKEN_TIMELINE) : '';
const BITLY_ACCESS_TOKEN = process.env.BITLY_ACCESS_TOKEN ? String(process.env.BITLY_ACCESS_TOKEN) : '';

export const config = {
    mongo: {
        username: MONGO_USERNAME,
        password: MONGO_PASSWORD,
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    },
    token: {
        salt: SALT_WORK_FACTOR,
        access_token_private_key: ACCESS_TOKEN_PRIVATE_KEY,
        access_token_public_key: ACCESS_TOKEN_PUBLIC_KEY,
        refresh_token_private_key: REFRESH_TOKEN_PRIVATE_KEY,
        refresh_token_public_key: REFRESH_TOKEN_PUBLIC_KEY,
        access_token_timeline: ACCESS_TOKEN_TIMELINE,
        refresh_token_timeline: REFRESH_TOKEN_TIMELINE
    },
    thirdParty: {
        bitlyAccesssToken: BITLY_ACCESS_TOKEN
    }
};
