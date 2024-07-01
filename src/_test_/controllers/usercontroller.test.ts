import { Request, Response } from 'express';
import { getUserProfile } from '../../controllers/usercontroller'; // Adjust this import
import { PrismaClient } from '@prisma/client';

// 模擬 PrismaClient 模組
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        user: {
            findFirst: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();


describe('getUserProfile', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    // 每個測試用例前都會執行這段代碼
    beforeEach(() => {
        req = {
            user: { id: '1' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    // 每個測試用例後都會執行這段代碼，清除所有 mock
    afterEach(() => {
        jest.clearAllMocks();
    });

    // 測試用例：應該返回用戶資料
    test('should return user profile data', async () => {
        const userinfo = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            profilePicture: 'test.png'
        };

        // 模擬 prisma.user.findFirst 方法返回用戶信息
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(userinfo);

        // 調用 getUserProfile 函數
        await getUserProfile(req as Request, res as Response);

        // 檢查 prisma.user.findFirst 是否按照預期參數被調用
        expect(prisma.user.findFirst).toHaveBeenCalledWith({
            where: { id: '1' },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true
            }
        });
        // 檢查 res.status 是否被調用並設置為 200
        expect(res.status).toHaveBeenCalledWith(200);
        // 檢查 res.json 是否返回用戶信息
        expect(res.json).toHaveBeenCalledWith({ data: userinfo });
    });

    // 測試用例：如果找不到用戶ID應該返回 401
    test('should return 401 if user id not found', async () => {
        // 模擬沒有用戶ID的情況
        req.user = {};

        // 調用 getUserProfile 函數
        await getUserProfile(req as Request, res as Response);

        // 檢查 res.status 是否被調用並設置為 401
        expect(res.status).toHaveBeenCalledWith(401);
        // 檢查 res.json 是否返回錯誤信息
        expect(res.json).toHaveBeenCalledWith({ message: 'user id not found' });
    });

    // 測試用例：如果用戶不存在應該返回 404
    test('should return 404 if user not found', async () => {
        // 模擬 prisma.user.findFirst 方法返回 null
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

        // 調用 getUserProfile 函數
        await getUserProfile(req as Request, res as Response);

        // 檢查 res.status 是否被調用並設置為 404
        expect(res.status).toHaveBeenCalledWith(404);
        // 檢查 res.json 是否返回錯誤信息
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

});
