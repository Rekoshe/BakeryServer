import pgPromise from 'pg-promise';
import env from './config';
import express, { NextFunction } from 'express';
import crypto from 'crypto'

const pgp = pgPromise();

export const dbOBJ = pgp(env.DB)

interface IDatabaseOperations<TArg, TResult> {
    (arg: TArg): Promise<TResult>;
}

type Credintials = {
    username: string;
    password: string;
}

export async function useDB(func: IDatabaseOperations<any, any>, data: any, next?: NextFunction): Promise<void | Express.User | boolean> {
    /*error handling function that passes to next() function*/
    try {

        return await func(data);
    } catch (e) {
        if (next) {
            next(e);
        } else {
            throw e;
        }

    }
}

function HashPassword(password: string, salt?: Buffer): { hash: Buffer | null, salt: Buffer } {

    //generate a salt if not provided
    if (!salt) {
        salt = crypto.randomBytes(16);
    }

    const hash = crypto.pbkdf2Sync(password, salt, 310000, 16, 'sha256');

    return { hash, salt };
}

export const InsertIntoDataSent: IDatabaseOperations<string, void> = async (data) => {
    await dbOBJ.none('INSERT INTO dataSent (value_string) VALUES($1)', data);
    console.log(`${data} has been added to the database`);
};

export const DeleteFromDataSent: IDatabaseOperations<string, void> = async (data) => {
    await dbOBJ.none('DELETE FROM dataSent WHERE data_id = $1', data);
    console.log(`${data} has been deleted from the database`);
};

export const GetUserData: IDatabaseOperations<string, Express.User | undefined> = async (username) => {

    const user = await dbOBJ.oneOrNone('SELECT * FROM users WHERE username = $1', username);
    if (!user) {
        throw new Error('User does not exist');
    } else {
        return user;
    }
};

export const CheckIfUserExists: IDatabaseOperations<string, boolean> = async (username) => {
    const res = await dbOBJ.one('SELECT COUNT(username) FROM users WHERE username = $1', username);
    return res.count as number >= 1;
};

export const InsertIntoUsers: IDatabaseOperations<Credintials, void> = async (userObj) => {

    const { hash, salt } = HashPassword(userObj.password);
    await dbOBJ.none('INSERT INTO users (username, hashed_password, salt) VALUES ($1, $2, $3)', [
        userObj.username,
        hash,
        salt
    ]);
};

export const VerifyUserPassword: IDatabaseOperations<Credintials, boolean> = async (creds) => {

    const DBhash = await GetUserData(creds.username) as {hashed_password : Buffer, salt : Buffer};


    const verHash = HashPassword(creds.password, DBhash.salt) as { hash: Buffer };

    if (!verHash) {
        throw new Error('encrytion error');
    }

    if (crypto.timingSafeEqual(DBhash.hashed_password, verHash.hash)) {
        return true;
    } else {
        return false;
    }

}