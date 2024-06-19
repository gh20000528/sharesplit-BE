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
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifications = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["error"] = 400] = "error";
    ResponseStatus[ResponseStatus["not_found"] = 404] = "not_found";
    ResponseStatus[ResponseStatus["success"] = 200] = "success";
})(ResponseStatus || (ResponseStatus = {}));
const notifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user.id) {
            return res.status(ResponseStatus.not_found).json({ message: 'user not found' });
        }
        const receivedRequest = yield prisma.friendRequest.findMany({
            where: {
                receiverId: user.id,
                status: 'pending'
            },
            include: {
                sender: true
            }
        });
        const acceptedRequest = yield prisma.friendships.findMany({
            where: {
                userId: user.id,
                status: 'accepted'
            },
            include: {
                Friend: true
            }
        });
        // 建構通知列表
        const notifications = [
            ...receivedRequest.map(request => ({
                id: request.id,
                type: 'friend_request',
                message: `${request.sender.username} 發送好友邀請`,
                createdAt: request.createdAt
            })),
            ...acceptedRequest.map(friendship => ({
                type: 'friend_accepted',
                message: `${friendship.Friend.username} 接受你的好友邀請`,
                createdAt: friendship.createdAt,
            }))
        ];
        // 按照時間排序
        notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        console.log(notifications);
        return res.status(ResponseStatus.success).json({ data: notifications });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `notif api error: ${error}` });
    }
});
exports.notifications = notifications;
