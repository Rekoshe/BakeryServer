import express, { Response, Request, NextFunction } from 'express';
import pgPromise from 'pg-promise';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import session from 'express-session';
import pgStore from 'connect-pg-simple';
import env from './config';

const pgp = pgPromise();

const db = pgp(env.DB)

const Store = pgStore(session);

const router = express.Router();

passport.use(new LocalStrategy.Strategy((username, password, cb) => {

    db.one('SELECT * FROM users WHERE username = $1', username).then(

        (data: Express.User) => {

            crypto.pbkdf2(password, data.salt, 310000, 16, 'sha256', (err, hashResult) => {

                if (crypto.timingSafeEqual(data.hashed_password, hashResult)) {

                    return cb(null, data, { message: 'user ' + data.username + ' logged in succesfully' });
                } else {

                    return cb(new Error('incorrect password'), false, { message: 'incorrect password' });
                }
            })
        }
    ).catch(() => {

        return cb(new Error('username does not exist'), false, { message: "username does not exist" });
    })
}))

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
            pgPromise: db,
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
            console.log(err.message)
            return next(err);
        }

        if (!user) {
            console.log(info.message)
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

router.post('/addUser', (req, res, next) => {

    if (!req.body) {
        console.log(req.body)
        return res.status(401).json({ message: 'no user was sent' })
    }

    //check to see if user already exists
    db.one('SELECT COUNT(username) FROM users WHERE username = $1', req.body?.username).then((response) => {

        // if user already exists
        if (response.count === '1') {
            return next(new Error('user already exists'));
        }

        //add new user
        if (req.body) {
            const salt = crypto.randomBytes(16)

            crypto.pbkdf2(req.body?.password, salt, 310000, 16, 'sha256', (err, hashResult) => {

                db.none('INSERT INTO users (username, hashed_password, salt) VALUES ($1, $2, $3)', [req.body?.username, hashResult, salt]).then(() => {
                    console.log('user added to db');

                    req.logIn(req.body, () => {
                        return res.status(200).json({ message: 'Signed up successfully' })
                    })


                }).catch((err) => { return next(err) });

            })
        }

    }).catch((err) => { return next(err) }
    )

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