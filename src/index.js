"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_session_1 = __importDefault(require("cookie-session"));
require("./passport/auth");
const userRoute_1 = require("./routes/userRoute");
const passport_1 = __importDefault(require("passport"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.configureMiddleware();
        this.setUpRoutes();
    }
    configureMiddleware() {
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        this.app.use(body_parser_1.default.json()); // 解析 JSON 请求体
        this.app.use((0, cookie_session_1.default)({ keys: ['laskdjf'] }));
        this.app.use(passport_1.default.initialize());
        this.app.use(passport_1.default.session());
    }
    setUpRoutes() {
        const userRoute = new userRoute_1.UserRoute();
        this.app.use('/api/user', userRoute.router);
    }
    start() {
        this.app.listen(3003, () => {
            console.log('listening on port 3003');
        });
    }
}
new Server().start();
