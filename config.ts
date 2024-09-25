import * as dotenv from 'dotenv';

dotenv.config();

interface EnvVariables {
    DB: string;
    SESSION_SECRET: string;
}

const env: EnvVariables = {
    DB: process.env.DB as string,
    SESSION_SECRET: process.env.SESSION_SECRET as string
};


export default env