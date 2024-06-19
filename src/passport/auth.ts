import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';

// db init
const prisma = new PrismaClient();

dotenv.config();

passport.serializeUser((user: any, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id: number, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback"
}, async (token, tokenSecret, profile, done) => {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const image = profile.photos && profile.photos[0] ? profile.photos[0].value : null
    
    if (!email) {   
        return done(new Error('No email found Google profile'));
    }
    
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        user = await prisma.user.create({
            data: {
                username: profile.displayName,
                email: email,
                googleId: profile.id,
                profilePicture: image,
                password: '',
            }
        })
    } else {
        user = await prisma.user.update({
            where: { email },
            data: {
                profilePicture: image
            }
        })
    }


    return done(null, user);
}))

// jwt init
const jwtOption = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'sharesplit'
}

passport.use(new JwtStrategy(jwtOption, async (jw_payload, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: jw_payload.id } })
        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    } catch (error) {
        return done(error, false)
    }
}))

export default passport;