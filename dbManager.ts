import pgPromise from 'pg-promise';
import env from './config';
import express, { NextFunction } from 'express';

const pgp = pgPromise();

export const dbOBJ = pgp(env.DB)

interface IDatabaseOperations<TArg, TResult> {
    (arg: TArg): Promise<TResult>;
}

export async function useDB(func: IDatabaseOperations<any, any>, data: any, next?: NextFunction) : Promise<void | Express.User | boolean> {
    try {

        return await func(data);
    } catch (e) {
        if (next)
            next(e);
    }
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
    return await dbOBJ.one('SELECT * FROM users WHERE username = $1', username);
};

export const CheckIfUserExists: IDatabaseOperations<string, boolean> = async (username) => {
    const res = await dbOBJ.one('SELECT COUNT(username) FROM users WHERE username = $1', username);
    return res.count as number >= 1;
};

export const InsertIntoUsers: IDatabaseOperations<Express.User, void> = async (user) => {
    await dbOBJ.none('INSERT INTO users (username, hashed_password, salt) VALUES ($1, $2, $3)', [
        user.username,
        user.hashed_password,
        user.salt
    ]);
};
