import { Router, Request, Response } from 'express';
import '../passport/auth';
import passport, { session } from 'passport';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { getUserProfile, userList } from '../controllers/usercontroller';
import cookieSession from 'cookie-session';

const prisma = new PrismaClient();
dotenv.config();

export class UserRoute {
    router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    public initRoutes() {
        this.router.use(cookieSession({
            name: 'session',
            keys: ['token'],
            maxAge: 24 * 60 * 60 * 1000 // 24hr
        }))

        // google Oauth routes
        this.router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
        this.router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), async (req: Request, res: Response) => {
            try {
                if (req.user) {
                    const googleUser = req.user as any;
                    const email = googleUser.email;
                    const googleId = googleUser.id;

                    if (!email) {
                        return res.status(400).json({ error: "Email not found in user profile" })
                    }
                    // 檢查 user 是否存在
                    let user = await prisma.user.findFirst({
                        where: { email: email }
                    })
    
                    if (!user) {
                        user = await prisma.user.create({
                            data: {
                                username: googleUser.displayName,
                                email: email,
                                googleId: googleId,
                                profilePicture: googleUser.profilePicture,
                                password: ''
                            }
                        });
                    }
    
                    const token = jwt.sign({ id: user.id }, "sharesplit", { expiresIn: '24h' });

                    res.cookie('session', token, {httpOnly: false, secure: false, sameSite: 'lax', path: '/'})
                    
                    res.redirect('http://localhost:3000/home/group');
                } else {
                    res.redirect('/')
                }
            } catch (error) {
                console.log(error);
            }
        })
        this.router.get('/api/user/logout', (req, res) => {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Logout failed', error: err });
                }
                res.redirect('/');
            });
        })
        this.router.get('/api/user/profile', passport.authenticate('jwt', { session: false }), getUserProfile)
        this.router.get('/api/user/userlist', userList)
    }
}