import { Router } from 'express';
import { acceptedList, addAccount, softAccount, upadteAccount } from '../controllers/accountController';

export class AccountRoute {
    router: Router

    constructor() {
        this.router = Router()
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post('/accountList', acceptedList)
        this.router.post('/addAccount', addAccount)
        this.router.post('/updateAccount', upadteAccount)
        this.router.delete('softAccount', softAccount)
    }
}