import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

enum ResponseStatus {
    error = 400,
    not_found = 404,
    success = 200
}

export const userList = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findMany()

        return res.status(ResponseStatus.success).json({ data: user })
    } catch (error) {
        res.status(ResponseStatus.error).json({})
    }
}

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user.id) {
            return res.status(401).json({ message: "user id not found" })
        }

        const userinfo = await prisma.user.findFirst({
            where: { id: user.id },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true
            }
        })

        if (!userinfo) {
            return res.status(ResponseStatus.not_found).json({ error: "User not found" });
        }

        console.log(userinfo);
        
        res.status(ResponseStatus.success).json({ data: userinfo })
    } catch (error) {
        console.log(error);
    }
}