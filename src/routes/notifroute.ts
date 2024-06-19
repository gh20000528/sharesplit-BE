import { Router } from 'express';
import {notifications} from '../controllers/notifcontroller';
import passport from 'passport';

export class NotifRoute {
    router: Router

    constructor() {
        this.router = Router()
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get('/notifications', passport.authenticate('jwt', {session: false}), notifications)
    }
}