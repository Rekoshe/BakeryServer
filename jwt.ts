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

        if (token) {
            return token.split('=')[1]
        }
        return null;

        // Extract the token value
    }]),
    secretOrKey: env.JWT_KEY
}

//this is for extra verification after the token was verified by the user
const verify: VerifyCallback = function (jwtPayload: CustomJwtPayload, done: VerifiedCallback) {
    try {
        if (jwtPayload) {
            return done(null, jwtPayload);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }

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
        res.json({ message: 'Logged in successfully', token })

    })(req, res, next)

})


//this path can only be accessed if jwt is valid
router.post('/login', (req, res, next) => {

    passport.authenticate('jwt', { session: false }, (err: any, user: CustomJwtPayload | false, info: undefined | Error | { message: string }) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(err);
        }
        return res.status(200).json({ message: 'logged in succesfully' });
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

    res.status(200).json({ message: 'user added successfully' });

    //return res.status(500);
})

router.post('/logOut', (req, res, next) => {
    

    res.clearCookie('jwt'); // Adjust the cookie name if necessary
    console.log("user logged out")
    return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;



