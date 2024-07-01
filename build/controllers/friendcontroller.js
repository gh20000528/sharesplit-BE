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
exports.acceptFriendRequest = exports.sendFriendRequest = exports.searchUser = exports.deleteFriend = exports.addFriend = exports.friendlist = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["error"] = 400] = "error";
    ResponseStatus[ResponseStatus["not_found"] = 404] = "not_found";
    ResponseStatus[ResponseStatus["success"] = 200] = "success";
})(ResponseStatus || (ResponseStatus = {}));
const friendlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const friendships = yield prisma.friendships.findMany({
            where: {
                OR: [
                    { userId, status: 'accepted' },
                    { friendId: userId, status: 'accepted' }
                ]
            },
            include: {
                User: true, // 包含用户信息
                Friend: true // 包含朋友信息
            }
        });
        // 格式化返回的数据，使其包含朋友的信息
        const friends = friendships.map(friendship => {
            const isUser = friendship.userId !== userId;
            return {
                id: isUser ? friendship.friendId : friendship.userId,
                name: isUser ? friendship.Friend.username : friendship.User.username,
                email: isUser ? friendship.Friend.email : friendship.User.email,
                profilePicture: isUser ? friendship.Friend.profilePicture : friendship.User.profilePicture
            };
        });
        return res.status(ResponseStatus.success).json({ data: friends });
    }
    catch (error) {
        return res.status(ResponseStatus.error).json({ message: `friend list api error: ${error}` });
    }
});
exports.friendlist = friendlist;
const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, friendId } = req.body;
        const existingFriendship = yield prisma.friendships.findUnique({
            where: {
                userId_friendId: {
                    userId,
                    friendId
                }
            }
        });
        if (existingFriendship) {
            return res.status(401).json({ message: 'Already friend or requst pending' });
        }
        const newfriend = yield prisma.friendships.create({
            data: {
                userId,
                friendId,
                status: 'pending'
            }
        });
        return res.status(ResponseStatus.success).json({ message: 'add friend success' });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `add friend error api error: ${error}` });
    }
});
exports.addFriend = addFriend;
const deleteFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, friendId } = req.body;
        yield prisma.friendships.delete({
            where: {
                userId_friendId: {
                    userId,
                    friendId
                }
            }
        });
        return res.status(ResponseStatus.success).json({ message: `deleted frined id: ${friendId}` });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `deleted user api error: ${error}` });
    }
});
exports.deleteFriend = deleteFriend;
const searchUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        const query = typeof q === 'string' ? q : '';
        const users = yield prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        });
        return res.status(ResponseStatus.success).json({ data: users });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `sreach user error: ${error}` });
    }
});
exports.searchUser = searchUser;
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, friendId } = req.body;
        const existingRequest = yield prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: userId,
                    receiverId: friendId
                }
            }
        });
        if (existingRequest) {
            return res.status(401).json({ message: "friend req is already init" });
        }
        const newRequest = yield prisma.friendRequest.create({
            data: {
                senderId: userId,
                receiverId: friendId,
                status: 'pending'
            }
        });
        const sendNotification = global.sendNotification;
        sendNotification(friendId.toString(), {
            id: newRequest.id,
            type: 'friend_request',
            message: `你有一個新的好友請求來自 ${userId}`,
            createdAt: new Date()
        });
        return res.status(ResponseStatus.success).json({ message: 'send friend req success' });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `send frined req api error: ${error}` });
    }
});
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.body;
        const request = yield prisma.friendRequest.findUnique({
            where: {
                id: requestId
            }
        });
        if (!request) {
            return res.status(ResponseStatus.not_found).json({ message: 'frined req not found' });
        }
        const newfriendship = yield prisma.friendships.create({
            data: {
                userId: request.senderId,
                friendId: request.receiverId,
                status: 'accepted'
            }
        });
        yield prisma.friendRequest.delete({
            where: { id: requestId },
        });
        const sendNotification = global.sendNotification;
        sendNotification(request.senderId.toString(), {
            type: 'friend_accepted',
            message: `你已接受對方的好友邀請`,
            createdAt: new Date()
        });
        return res.status(ResponseStatus.success).json({ message: 'add friend success' });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `add frind api error: ${error}` });
    }
});
exports.acceptFriendRequest = acceptFriendRequest;
//# sourceMappingURL=friendcontroller.js.map