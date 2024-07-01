"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifRoute = void 0;
const express_1 = require("express");
const notifcontroller_1 = require("../controllers/notifcontroller");
const passport_1 = __importDefault(require("passport"));
class NotifRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    initRoutes() {
        this.router.get('/notifications', passport_1.default.authenticate('jwt', { session: false }), notifcontroller_1.notifications);
    }
}
exports.NotifRoute = NotifRoute;
//# sourceMappingURL=notifroute.js.map