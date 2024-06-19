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
const auth_1 = __importDefault(require("./passport/auth"));
const cors_1 = __importDefault(require("cors"));
const groupRoute_1 = require("./routes/groupRoute");
const friendRoute_1 = require("./routes/friendRoute");
const notifroute_1 = require("./routes/notifroute");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });
        this.configureMiddleware();
        this.setUpRoutes();
        this.setUpSocket();
    }
    configureMiddleware() {
        this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        this.app.use(body_parser_1.default.json()); // 解析 JSON 请求体
        this.app.use((0, cookie_session_1.default)({
            name: 'session',
            keys: [process.env.SESSION_SECRET || 'default_session_secret'],
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }));
        this.app.use(auth_1.default.initialize());
        this.app.use(auth_1.default.session());
        this.app.use((0, cors_1.default)({
            origin: 'http://localhost:3000',
            credentials: true
        }));
    }
    setUpRoutes() {
        const userRoute = new userRoute_1.UserRoute();
        const groupRoute = new groupRoute_1.GroupRoute();
        const friendRoute = new friendRoute_1.FriendRoute();
        const notifRoute = new notifroute_1.NotifRoute();
        this.app.use('/', userRoute.router);
        this.app.use('/api/group', groupRoute.router);
        this.app.use('/api/friend', friendRoute.router);
        this.app.use('/api/notif', notifRoute.router);
    }
    setUpSocket() {
        const client = new Map();
        this.io.on('connection', (socket) => {
            const userId = socket.handshake.query.userId;
            if (userId) {
                client.set(userId, socket.id);
                socket.on('disconnect', () => {
                    client.delete(userId);
                });
            }
            console.log(`User connected: ${userId}`);
        });
        const sendNotification = (userId, notification) => {
            const socketId = client.get(userId);
            if (socketId) {
                this.io.to(socketId).emit('notification', notification);
            }
        };
        // 将 sendNotification 函数暴露给其他模块
        global.sendNotification = sendNotification;
    }
    start() {
        this.server.listen(3003, () => {
            console.log('listening on port 3003');
        });
    }
}
new Server().start();
