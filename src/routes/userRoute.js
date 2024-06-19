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
exports.UserRoute = void 0;
const express_1 = require("express");
require("../passport/auth");
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const usercontroller_1 = require("../controllers/usercontroller");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
class UserRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        // google Oauth routes
        this.router.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
        this.router.get('/auth/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/' }), (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.user) {
                const googleUser = req.user;
                const email = googleUser.emails[0].value;
                const googleId = googleUser.id;
                // 檢查 user 是否存在
                let user = yield prisma.user.findFirst({
                    where: { email: email }
                });
                if (!user) {
                    user = yield prisma.user.create({
                        data: {
                            username: googleUser.displayName,
                            email: email,
                            googleId: googleId,
                            password: ''
                        }
                    });
                }
                const token = jsonwebtoken_1.default.sign({ id: user.id }, "sharesplit", { expiresIn: '1h' });
                res.json({ token });
            }
            else {
                res.redirect('/');
            }
        }));
        this.router.get('/logout', (req, res) => {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Logout failed', error: err });
                }
                res.redirect('/');
            });
        });
        this.router.get('/profile', passport_1.default.authenticate('jwt', { session: false }), usercontroller_1.getUserProfile);
    }
}
exports.UserRoute = UserRoute;
