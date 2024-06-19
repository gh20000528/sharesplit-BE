import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient()

enum ResponseStatus {
    error = 400,
    not_found = 404,
    success = 200
}

interface addGroupreq {
    name: string; 
    userId: number; 
    invitedFriends: number[]
}

export const groupList = async (req: Request, res: Response) => {
    try {
        const user = req.user as any

        const joinGroup = await prisma.userGroup.findMany({
            where: { userId: user.id },
            include: {
                group: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return res.status(ResponseStatus.success).json({ data: joinGroup })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message:`get all group api:${error}` })
    }
}

export const addGroup = async (req: Request, res: Response) => {
    try {
        const { name, userId, invitedFriends }: addGroupreq = req.body
        
        const group = await prisma.group.findFirst({
            where: { name }
        })

        if (group) {
            return res.status(401).json({ message: 'group name is already init' })
        }
        const newGroup = await prisma.group.create({
            data: {
                name: name,
                deleted: false,
                createUserId: userId,
                userGroup: {
                    create: invitedFriends.map((frinedId: number) => ({
                        userId: frinedId
                    }))
                }
            }
        })

        await prisma.userGroup.create({
            data: {
                userId: userId,
                groupId: newGroup.id
            }
        })

        return res.status(ResponseStatus.success).json({ message: 'creaet group success' })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `add group api: ${error}` })
    }
}

export const editGroup = async (req: Request, res: Response) => {
    try {
        const { id, newName } = req.body

        const group = await prisma.group.findFirst({
            where: { id }
        })

        if (group) {
            return res.status(ResponseStatus.not_found).json({ message: 'edit group api error: group not found' })
        }

        const softGroup = await prisma.group.update({
            where: { id },
            data: {
                name: newName
            }
        })

        return res.status(ResponseStatus.success).json({ message: 'update success' })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `edit group api error: ${error}` })
    }
}

export const softGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        const group = await prisma.group.findFirst({
            where: { id }
        })

        if (group) {
            return res.status(ResponseStatus.not_found).json({ message: 'deleted group api error: group not found' })
        }

        const softGroup = await prisma.group.update({
            where: { id },
            data: {
                deleted: true
            }
        })

        return res.status(ResponseStatus.success).json({ message: 'deleted success' })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `soft group api error: ${error}` })
    }
}

export const joinUsre = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.body
        
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { name: true }
        })

        
        if (!group) {
            return res.status(ResponseStatus.not_found).json({ message: 'group not found' })
        }

        const groupUser = await prisma.userGroup.findMany({
            where: { groupId },
        })

        const userId = groupUser.map((user) => (user.userId))

        const groupUserInfo = await prisma.user.findMany({
            where: {id: {in: userId}}
        })        
        
        const data = {
            groupName: group.name,
            groupSize: groupUser.length,
            users: groupUserInfo
        }

        return res.status(ResponseStatus.success).json({ data })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `join user api err: ${error}` })
    }
}
