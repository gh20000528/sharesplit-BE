"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.userList = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["error"] = 400] = "error";
    ResponseStatus[ResponseStatus["not_found"] = 404] = "not_found";
    ResponseStatus[ResponseStatus["success"] = 200] = "success";
})(ResponseStatus || (ResponseStatus = {}));
const userList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findMany();
        return res.status(ResponseStatus.success).json({ data: user });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({});
    }
});
exports.userList = userList;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user.id) {
            return res.status(401).json({ message: "user id not found" });
        }
        const userinfo = yield prisma.user.findFirst({
            where: { id: user.id },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true
            }
        });
        if (!userinfo) {
            return res.status(ResponseStatus.not_found).json({ error: "User not found" });
        }
        console.log(userinfo);
        res.status(ResponseStatus.success).json({ data: userinfo });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUserProfile = getUserProfile;
