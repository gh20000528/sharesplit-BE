"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_jwt_1 = require("passport-jwt");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// db init
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({ where: { id } });
    done(null, user);
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (token, tokenSecret, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const image = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
    if (!email) {
        return done(new Error('No email found Google profile'));
    }
    let user = yield prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = yield prisma.user.create({
            data: {
                username: profile.displayName,
                email: email,
                googleId: profile.id,
                profilePicture: image,
                password: '',
            }
        });
    }
    else {
        user = yield prisma.user.update({
            where: { email },
            data: {
                profilePicture: image
            }
        });
    }
    return done(null, user);
})));
// jwt init
const jwtOption = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'sharesplit'
};
passport_1.default.use(new passport_jwt_1.Strategy(jwtOption, (jw_payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { id: jw_payload.id } });
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }
    catch (error) {
        return done(error, false);
    }
})));
exports.default = passport_1.default;
//# sourceMappingURL=auth.js.map