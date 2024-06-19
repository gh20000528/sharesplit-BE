import { Router } from 'express';
import {groupList, addGroup, editGroup, softGroup, joinUsre} from '../controllers/groupcontroller';
import passport from 'passport';

export class GroupRoute {
    router: Router;

    constructor() {
        this.router = Router()
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get('/grouplist', passport.authenticate('jwt', { session: false }), groupList)
        this.router.post('/addgroup', addGroup)
        this.router.post('/editgroup', editGroup)
        this.router.post('/softgroup', softGroup)
        this.router.post('/groupJoinUser', joinUsre)
    }
}