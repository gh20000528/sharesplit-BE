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
exports.softAccount = exports.upadteAccount = exports.addAccount = exports.acceptedList = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["error"] = 400] = "error";
    ResponseStatus[ResponseStatus["not_fount"] = 404] = "not_fount";
    ResponseStatus[ResponseStatus["success"] = 200] = "success";
    ResponseStatus[ResponseStatus["unauthorized"] = 401] = "unauthorized";
})(ResponseStatus || (ResponseStatus = {}));
const acceptedList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.body;
        const account = yield prisma.groupAccounts.findMany({
            where: { groupId: Number(groupId) },
        });
        const accountWithUserInfo = yield Promise.all(account.map((a) => __awaiter(void 0, void 0, void 0, function* () {
            const createByUser = yield prisma.user.findFirst({
                where: { id: Number(a.createBy) },
                select: {
                    username: true,
                    profilePicture: true
                }
            });
            const joinUserIds = JSON.parse(a.joinUser);
            const joinUsers = yield Promise.all(joinUserIds.map((u) => __awaiter(void 0, void 0, void 0, function* () {
                return yield prisma.user.findUnique({
                    where: { id: u },
                    select: {
                        username: true,
                        profilePicture: true
                    }
                });
            })));
            const accountInfo = {
                id: a.id,
                title: a.title,
                price: a.price,
                joiUser: joinUsers,
                createBy: createByUser,
                groupId: a.groupId,
                createdAt: a.createdAt
            };
            return accountInfo;
        })));
        console.log(accountWithUserInfo);
        return res.status(ResponseStatus.success).json({ data: accountWithUserInfo });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `account list api error: ${error}` });
    }
});
exports.acceptedList = acceptedList;
const addAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, price, joinUser, groupId, createBy } = req.body;
        console.log(typeof createBy);
        if (!title || !price || !joinUser || !groupId || !createBy) {
            return res.status(ResponseStatus.unauthorized).json({ message: "Missing req file" });
        }
        const newAccount = yield prisma.groupAccounts.create({
            data: {
                title,
                price,
                joinUser: JSON.stringify(joinUser),
                groupId,
                createBy
            }
        });
        return res.status(ResponseStatus.success).json({ message: "add account success" });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `add account api error: ${error}` });
    }
});
exports.addAccount = addAccount;
const upadteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, title, price, joinUser, createBy } = req.body;
        if (!id) {
            return res.status(ResponseStatus.not_fount).json({ message: 'account not found' });
        }
        const upadteAccount = yield prisma.groupAccounts.update({
            where: { id },
            data: {
                title,
                price,
                joinUser: JSON.stringify(joinUser),
                createBy
            }
        });
        return res.status(ResponseStatus.success).json({ message: "update success" });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `update account api error: ${error}` });
    }
});
exports.upadteAccount = upadteAccount;
const softAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(ResponseStatus.not_fount).json({ message: 'account not found' });
        }
        yield prisma.groupAccounts.delete({
            where: { id }
        });
        return res.status(ResponseStatus.success).json({ message: 'delete account success' });
    }
    catch (error) {
        res.status(ResponseStatus.error).json({ message: `delete account api error: ${error}` });
    }
});
exports.softAccount = softAccount;
//# sourceMappingURL=accountController.js.map