"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRoute = void 0;
const express_1 = require("express");
const groupcontroller_1 = require("../controllers/groupcontroller");
const passport_1 = __importDefault(require("passport"));
class GroupRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get('/grouplist', passport_1.default.authenticate('jwt', { session: false }), groupcontroller_1.groupList);
        this.router.post('/addgroup', groupcontroller_1.addGroup);
        this.router.post('/editgroup', groupcontroller_1.editGroup);
        this.router.post('/softgroup', groupcontroller_1.softGroup);
        this.router.post('/groupJoinUser', groupcontroller_1.joinUsre);
    }
}
exports.GroupRoute = GroupRoute;
