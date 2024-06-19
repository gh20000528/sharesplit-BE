"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRoute = void 0;
const express_1 = require("express");
const friendcontroller_1 = require("../controllers/friendcontroller");
class FriendRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.post('/sendfriendreq', friendcontroller_1.sendFriendRequest);
        this.router.post('/friendlist', friendcontroller_1.friendlist);
        this.router.post('/deletedfriend', friendcontroller_1.deleteFriend);
        this.router.get('/searchUser', friendcontroller_1.searchUser);
        this.router.post('/acceptfriend', friendcontroller_1.acceptFriendRequest);
    }
}
exports.FriendRoute = FriendRoute;
