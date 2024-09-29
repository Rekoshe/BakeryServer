import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { localStrategy } from './auth';
import passportJwt, { Strategy, ExtractJwt, VerifiedCallback, VerifyCallback } from 'passport-jwt';
import env from './config'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CheckIfUserExists, InsertIntoUsers, useDB } from './dbManager';

const router = express.Router();

interface CustomJwtPayload extends JwtPayload {
    username: string;
}


// using the local strategy for basic authentication 
passport.use(localStrategy);

//strategy options
const strategyOptions: passportJwt.StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
        //extracting the token from the cookie header
        const token = req.headers.cookie
            ?.split('; ')
            .find((cookie) => cookie.startsWith('jwt=')); // Adjust 'jwt' to your cookie name
            
        return token ? token.split('=')[1] : null; // Extract the token value
    }]),
    secretOrKey: env.JWT_KEY
}

//this is for extra verification after the token was verified by the user
const verify : VerifyCallback = function(jwt_payload: CustomJwtPayload, done: VerifiedCallback) {
    return done(null, false, jwt_payload.username + ' is using the token');
}

const jwtStrategy = new Strategy(strategyOptions, verify);

passport.use(jwtStrategy);

router.use(passport.initialize());

//logging in without JWT
router.post('/auth', async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error, user: Express.User) => {

        if (err) {
            return next(err);
        }

        if (!user) {
            return next(err);
        }



        // If authentication is successful
        const payload: CustomJwtPayload = {
            username: user.username
        }

        //generate token
        const token = jwt.sign(payload, env.JWT_KEY, {
            expiresIn: '1h',
        });

        res.cookie('jwt', token, { httpOnly: true, secure: false });  // Adjust secure flag for HTTPS
        res.json({ message: 'Logged in successfully', token });

    })(req, res, next)

})


//this path can only be accessed if jwt is valid
router.post('/logOut', (req, res, next) => {

    passport.authenticate('jwt', { session: false }, (err : any, user?: unknown | false, info?: any) => {

        console.log(info);
        res.clearCookie('jwt');
        return res.status(200).json({message: 'logged out succesfully'});
    })(req, res, next);

    res.status(500);
});

router.post('/addUser', async (req, res, next) => {

    if (!req.body) {
        console.log(req.body)
        return res.status(401).json({ message: 'no user was sent' });
    }

    //check to see if user already exists
    const response = await useDB(CheckIfUserExists, req.body.username, next);

    if (response === true) {
        return next(new Error('user already exists'));
    }

    //add new user
    await useDB(InsertIntoUsers, req.body, next);


    console.log('user added to db');

    res.status(200).json({message: 'user added successfully'});

    //return res.status(500);
})

export default router;



