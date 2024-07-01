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
exports.joinUsre = exports.softGroup = exports.editGroup = exports.addGroup = exports.groupList = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["error"] = 400] = "error";
    ResponseStatus[ResponseStatus["not_found"] = 404] = "not_found";
    ResponseStatus[ResponseStatus["success"] = 200] = "success";
})(ResponseStatus || (ResponseStatus = {}));
const groupList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const joinGroup = yield prisma.userGroup.findMany({
            where: { userId: user.id },
            include: {
                group: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return res.status(ResponseStatus.success).json({ data: joinGroup });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `get all group api:${error}` });
    }
});
exports.groupList = groupList;
const addGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, userId, invitedFriends } = req.body;
        const group = yield prisma.group.findFirst({
            where: { name }
        });
        if (group) {
            return res.status(401).json({ message: 'group name is already init' });
        }
        const newGroup = yield prisma.group.create({
            data: {
                name: name,
                deleted: false,
                createUserId: userId,
                userGroup: {
                    create: invitedFriends.map((frinedId) => ({
                        userId: frinedId
                    }))
                }
            }
        });
        yield prisma.userGroup.create({
            data: {
                userId: userId,
                groupId: newGroup.id
            }
        });
        return res.status(ResponseStatus.success).json({ message: 'creaet group success' });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `add group api: ${error}` });
    }
});
exports.addGroup = addGroup;
const editGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, newName } = req.body;
        const group = yield prisma.group.findFirst({
            where: { id }
        });
        if (group) {
            return res.status(ResponseStatus.not_found).json({ message: 'edit group api error: group not found' });
        }
        const softGroup = yield prisma.group.update({
            where: { id },
            data: {
                name: newName
            }
        });
        return res.status(ResponseStatus.success).json({ message: 'update success' });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `edit group api error: ${error}` });
    }
});
exports.editGroup = editGroup;
const softGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const group = yield prisma.group.findFirst({
            where: { id }
        });
        if (group) {
            return res.status(ResponseStatus.not_found).json({ message: 'deleted group api error: group not found' });
        }
        const softGroup = yield prisma.group.update({
            where: { id },
            data: {
                deleted: true
            }
        });
        return res.status(ResponseStatus.success).json({ message: 'deleted success' });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `soft group api error: ${error}` });
    }
});
exports.softGroup = softGroup;
const joinUsre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.body;
        const group = yield prisma.group.findUnique({
            where: { id: groupId },
            select: { name: true }
        });
        if (!group) {
            return res.status(ResponseStatus.not_found).json({ message: 'group not found' });
        }
        const groupUser = yield prisma.userGroup.findMany({
            where: { groupId },
        });
        const userId = groupUser.map((user) => (user.userId));
        const groupUserInfo = yield prisma.user.findMany({
            where: { id: { in: userId } }
        });
        const data = {
            groupName: group.name,
            groupSize: groupUser.length,
            users: groupUserInfo
        };
        return res.status(ResponseStatus.success).json({ data });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `join user api err: ${error}` });
    }
});
exports.joinUsre = joinUsre;
//# sourceMappingURL=groupcontroller.js.map