import * as dotenv from 'dotenv';

dotenv.config();

interface EnvVariables {
    DB: string;
    SESSION_SECRET: string;
    JWT_KEY: string;
    PORT: number;
}

const env: EnvVariables = {
    DB: process.env.DB as string,
    SESSION_SECRET: process.env.SESSION_SECRET as string,
    JWT_KEY: process.env.JWT_KEY as string,
    PORT: parseInt(process.env.PORT || '0', 10)
};


export default env