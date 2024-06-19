import { Router } from 'express';
import { sendFriendRequest, deleteFriend, friendlist, searchUser, acceptFriendRequest } from '../controllers/friendcontroller';

export class FriendRoute {
    router: Router

    constructor() {
        this.router = Router()
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post('/sendfriendreq', sendFriendRequest)
        this.router.post('/friendlist', friendlist)
        this.router.post('/deletedfriend', deleteFriend)
        this.router.get('/searchUser', searchUser)
        this.router.post('/acceptfriend', acceptFriendRequest)
    }
}