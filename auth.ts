import express, { Response, Request, NextFunction } from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import session from 'express-session';
import pgStore from 'connect-pg-simple';
import { dbOBJ, useDB, GetUserData, CheckIfUserExists, InsertIntoUsers, VerifyUserPassword } from './dbManager';
import env from './config';


const Store = pgStore(session);

const router = express.Router();

//strategy for basic username password verification
export const localStrategy = new LocalStrategy.Strategy(async (username, password, cb) => {

    try {
        const exists = await useDB(VerifyUserPassword, { username, password }) as boolean;

        if (exists === true) {
            return cb(false, { username, password })
        } else {
            return cb(new Error('incorrect password'), false);
        }

    } catch (e) {
        return cb(e, false);
    }

})

passport.use(localStrategy)

router.use(
    session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,  // 1 day
            secure: false,  // set to true if using HTTPS
            httpOnly: true
        },
        store: new Store({
            pgPromise: dbOBJ,
            tableName: 'session'
        })
    })
)







passport.serializeUser(function (user: Express.User, cb) {
    process.nextTick(function () {
        cb(null, { id: user.user_id, username: user.username });
    });
});

passport.deserializeUser(function (user: Express.User, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

router.use(passport.initialize());
router.use(passport.session());







function checkSession(req: Request, res: Response, next: NextFunction) {

    if (req.isAuthenticated()) {

        return res.status(401).json({ message: "user is already logged in" });

    }

    next();
}



router.use('/auth', checkSession);
router.use('/addUser', checkSession);


router.post('/auth', (req, res, next) => {

    passport.authenticate('local', (err: Error, user: Express.User, info: LocalStrategy.IVerifyOptions) => {

        if (err) {
            return next(err);
        }

        if (!user) {
            return next(err);
        }



        // If authentication is successful
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Return success response
            res.json({ message: 'Login successful' });
        });
    })(req, res, next)

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

    req.logIn(req.body, () => {
        return res.status(200).json({ message: 'Signed up successfully' })
    })

    //return res.status(500);
})

router.post('/logOut', (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    req.logout((err: any) => {
        if (err) {
            return next(err)
        }

        req.session.destroy((err: any) => {
            if (err) {
                return next(err);
            }

            // Clear the cookie if needed
            res.clearCookie('connect.sid'); // Adjust the cookie name if necessary
            console.log("user logged out")
            return res.status(200).json({ message: 'Logged out successfully' });


        });
    });
});

export default router;