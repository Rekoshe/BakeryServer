import { Express } from "express";


declare global {
  namespace Express {
    export interface User {
      user_id: number;
      username: string;
      password: string;
      hashed_password: Buffer;
      salt: Buffer;
    }
  }
}