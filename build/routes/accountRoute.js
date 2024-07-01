"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRoute = void 0;
const express_1 = require("express");
const accountController_1 = require("../controllers/accountController");
class AccountRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get('/accountList', accountController_1.acceptedList);
        this.router.post('/addAccount', accountController_1.addAccount);
        this.router.post('/updateAccount', accountController_1.upadteAccount);
        this.router.delete('softAccount', accountController_1.softAccount);
    }
}
exports.AccountRoute = AccountRoute;
//# sourceMappingURL=accountRoute.js.map