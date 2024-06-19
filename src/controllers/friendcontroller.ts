import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient()

enum ResponseStatus {
    error = 400,
    not_found = 404,
    success = 200
}

export const friendlist = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        
        const friendships = await prisma.friendships.findMany({
            where: {
                OR: [
                    { userId, status: 'accepted' },
                    { friendId: userId, status: 'accepted' }
                ]
            },
            include: {
                User: true,  // 包含用户信息
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
    } catch (error) {
        return res.status(ResponseStatus.error).json({ message: `friend list api error: ${error}` });
    }
}

export const addFriend = async (req: Request, res: Response) => {
    try {
        const {userId, friendId } = req.body

        const existingFriendship = await prisma.friendships.findUnique({
            where: {
                userId_friendId: {
                    userId,
                    friendId
                }
            }
        })

        if (existingFriendship) {
            return res.status(401).json({ message: 'Already friend or requst pending' })
        }

        const newfriend = await prisma.friendships.create({
            data:{
                userId,
                friendId,
                status: 'pending'
            }
        })

        return res.status(ResponseStatus.success).json({ message: 'add friend success' })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `add friend error api error: ${error}` })
    }
}

export const deleteFriend = async (req: Request, res: Response) => {
    try {
        const { userId, friendId } = req.body

        await prisma.friendships.delete({
            where: {
                userId_friendId:{
                    userId,
                    friendId
                }
            }
        })

        return res.status(ResponseStatus.success).json({ message: `deleted frined id: ${friendId}` })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `deleted user api error: ${error}` })
    }
}

export const searchUser = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        const query = typeof q === 'string' ? q : '';

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains:  query,
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
        })

        return res.status(ResponseStatus.success).json({ data: users })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `sreach user error: ${error}` })
    }
}

export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const  { userId, friendId } = req.body

        const existingRequest = await prisma.friendRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: userId,
                    receiverId: friendId
                }
            }
        })

        if (existingRequest) {
            return res.status(401).json({ message: "friend req is already init" })
        }

        const newRequest = await prisma.friendRequest.create({
            data: {
                senderId: userId,
                receiverId: friendId,
                status: 'pending'
            }
        })

        const sendNotification = (global as any).sendNotification;
        sendNotification(friendId.toString(), {
            id: newRequest.id,
            type: 'friend_request',
            message: `你有一個新的好友請求來自 ${userId}`,
            createdAt: new Date()
        })

        
        return res.status(ResponseStatus.success).json({ message: 'send friend req success' })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `send frined req api error: ${error}` })
    }
}

export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const { requestId } = req.body

        const request = await prisma.friendRequest.findUnique({
            where: {
                id: requestId
            }
        })

        if (!request) {
            return res.status(ResponseStatus.not_found).json({ message: 'frined req not found' })
        }

        const newfriendship = await prisma.friendships.create({
            data: {
                userId: request.senderId,
                friendId: request.receiverId,
                status: 'accepted'
            }
        })

        await prisma.friendRequest.delete({
            where: {id: requestId},
        })
        
        const sendNotification = (global as any).sendNotification;
        sendNotification(request.senderId.toString(), {
            type: 'friend_accepted',
            message: `你已接受對方的好友邀請`,
            createdAt: new Date()
        });
        return res.status(ResponseStatus.success).json({ message: 'add friend success' })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `add frind api error: ${error}` })
    }
}