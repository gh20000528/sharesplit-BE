import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookiesSession from 'cookie-session';
import './passport/auth';
import { UserRoute } from './routes/userRoute';
import passport from './passport/auth';
import cors from 'cors';
import { GroupRoute } from './routes/groupRoute';
import { FriendRoute } from './routes/friendRoute';
import { NotifRoute } from './routes/notifroute';
import http from 'http';
import {Server as SocketIOServer} from 'socket.io';
import { AccountRoute } from './routes/accountRoute';

class Server {
    app: express.Express = express();
    server: http.Server;
    io: SocketIOServer;

    constructor() {
        this.server = http.createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });
        this.configureMiddleware();
        this.setUpRoutes();
        this.setUpSocket();
    }

    private configureMiddleware(): void {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json()); // 解析 JSON 请求体
        this.app.use(cookiesSession({
            name: 'session',
            keys: [process.env.SESSION_SECRET || 'default_session_secret'],
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use(cors({
            origin: 'http://localhost:3000',
            credentials: true
        }))
    }

    private setUpRoutes(): void {
        const userRoute = new UserRoute();
        const groupRoute = new GroupRoute();
        const friendRoute = new FriendRoute();
        const notifRoute = new NotifRoute();
        const accountRoute = new AccountRoute();
        this.app.use('/', userRoute.router)
        this.app.use('/api/group', groupRoute.router)
        this.app.use('/api/friend', friendRoute.router)
        this.app.use('/api/notif', notifRoute.router)
        this.app.use('/api/account', accountRoute.router)
    }

    private setUpSocket(): void {
        const client = new Map<string, string>();

        this.io.on('connection', (socket) => {
            const userId = socket.handshake.query.userId as string
            if (userId) {
                client.set(userId, socket.id)

                socket.on('disconnect', () => {
                    client.delete(userId)
                })
            }
            console.log(`User connected: ${userId}`);
        })

        const sendNotification = (userId: string, notification: any) => {
            const socketId = client.get(userId);
            if (socketId) {
                this.io.to(socketId).emit('notification', notification);
            }
        };

        // 将 sendNotification 函数暴露给其他模块
        (global as any).sendNotification = sendNotification;
    }

    start(): void {
        this.server.listen(3003, () => {
            console.log('listening on port 3003');
        })
    }
}

new Server().start();