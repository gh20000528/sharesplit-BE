"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRoute = void 0;
const express_1 = require("express");
class FriendRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get('/friendlist');
    }
}
exports.FriendRoute = FriendRoute;
