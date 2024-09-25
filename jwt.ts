import express from 'express';
import passport from 'passport';
import passportJwt, {Strategy, ExtractJwt } from 'passport-jwt';
import env from './config'
import { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

const strategyOptions : passportJwt.StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_KEY
}

function verify(jwt_payload : JwtPayload, done: (error : Error, user: Express.User, info: any) => void){
    
}

const jwtStrategy = new Strategy(strategyOptions, verify)

export default router;



