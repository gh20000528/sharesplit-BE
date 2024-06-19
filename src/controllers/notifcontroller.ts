import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

enum ResponseStatus {
    error = 400,
    not_found = 404,
    success = 200
}

export const notifications = async (req: Request, res: Response) =>  {
    try {
        const user = req.user as any
        
        if (!user.id) {
            return res.status(ResponseStatus.not_found).json({ message: 'user not found' })
        }

        const receivedRequest = await prisma.friendRequest.findMany({
            where: {
                receiverId: user.id,
                status: 'pending'
            }, 
            include: {
                sender: true
            }
        })

        const acceptedRequest = await prisma.friendships.findMany({
            where: {
                userId: user.id,
                status: 'accepted'
            },
            include: {
                Friend: true
            }
        })
        
        

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
        ]
        // 按照時間排序
        notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log(notifications);
        return res.status(ResponseStatus.success).json({ data: notifications })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `notif api error: ${error}` })
    }
}