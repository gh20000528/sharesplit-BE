import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

enum ResponseStatus {
    error = 400,
    not_fount = 404,
    success = 200,
    unauthorized = 401
}

interface AddAccountReq {
    title: string,
    price: number,
    joinUser: [],
    groupId: number,
    createBy: string
}

export const acceptedList = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.body

        const account = await prisma.groupAccounts.findMany({
            where:{ groupId: Number(groupId) },
        })

        const accountWithUserInfo = await Promise.all(account.map(async (a) => {
            const createByUser = await prisma.user.findFirst({
                where: {id: Number(a.createBy)},
                select:{
                    username: true,
                    profilePicture: true
                }
            })

            const joinUserIds = JSON.parse(a.joinUser)
            const joinUsers = await Promise.all(joinUserIds.map(async (u: number) => {
                return await prisma.user.findUnique({
                    where:{ id: u },
                    select: {
                        username: true,
                        profilePicture: true
                    }
                })
            }))


            const accountInfo = {
                id: a.id,
                title: a.title,
                price: a.price,
                joiUser: joinUsers,
                createBy: createByUser,
                groupId: a.groupId,
                createdAt: a.createdAt
            }

            return accountInfo

        }))

        console.log(accountWithUserInfo);

        return res.status(ResponseStatus.success).json({ data: accountWithUserInfo })
    } catch (error) { 
        res.status(ResponseStatus.error).json({ message:`account list api error: ${error}` })
    }
}
  
export const addAccount = async (req: Request, res: Response) => {
    try {
        const { title, price, joinUser, groupId, createBy }: AddAccountReq = req.body

        console.log(typeof createBy);
        
        if (!title || !price || !joinUser || !groupId || !createBy) {
            return res.status(ResponseStatus.unauthorized).json({ message: "Missing req file" })
        }

        const newAccount = await prisma.groupAccounts.create({
            data: {
                title,
                price,
                joinUser: JSON.stringify(joinUser),
                groupId,
                createBy
            }
        })

        return res.status(ResponseStatus.success).json({ message: "add account success" })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `add account api error: ${error}` })
    }
}

export const upadteAccount = async (req: Request, res: Response) => {
    try {
        const { id, title, price, joinUser, createBy } = req.body

        if (!id) {
            return res.status(ResponseStatus.not_fount).json({ message: 'account not found' })
        }

        const upadteAccount = await prisma.groupAccounts.update({
            where: {id},
            data: {
                title,
                price,
                joinUser: JSON.stringify(joinUser),
                createBy
            }
        })
        return res.status(ResponseStatus.success).json({ message: "update success" })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `update account api error: ${error}` })
    }
}

export const softAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        if (!id) {
            return res.status(ResponseStatus.not_fount).json({ message: 'account not found'})
        }

        await prisma.groupAccounts.delete({ 
            where: {id}
        })
        return res.status(ResponseStatus.success).json({ message: 'delete account success' })
    } catch (error) {
        res.status(ResponseStatus.error).json({ message: `delete account api error: ${error}` })
    }
}