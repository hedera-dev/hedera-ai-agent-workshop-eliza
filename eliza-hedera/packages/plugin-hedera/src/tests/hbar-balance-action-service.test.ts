import { describe, it, expect, vi, beforeEach } from "vitest";
import {HederaProvider} from "../providers/client";
import {HbarBalanceActionService} from "../actions/balance-hbar/services/hbar-balance-action-service.ts";
import {HederaHbarBalanceParams} from "../actions/balance-hbar/types.ts";


// Mock dependencies
vi.mock("../providers/client");

const mockGetHbarBalance = vi.fn();
const mockHederaAgentKit = {
    getHbarBalance: mockGetHbarBalance,
};

describe("HbarBalanceActionService", () => {
    let service: HbarBalanceActionService;
    let mockHederaProvider: HederaProvider;

    beforeEach(() => {
        vi.clearAllMocks();

        mockGetHbarBalance.mockReset();

        // Setup provider mock
        mockHederaProvider = {
            getHederaAgentKit: vi.fn().mockReturnValue(mockHederaAgentKit),
        } as unknown as HederaProvider;

        service = new HbarBalanceActionService(mockHederaProvider);
    });

    describe("execute", () => {
        const validParams: HederaHbarBalanceParams = {
            symbol: "HBAR",
            address: "0.0.1234",
        };

        it("should throw error when address is missing", async () => {
            const invalidParams = { ...validParams, address: "" };
            await expect(service.execute(invalidParams)).rejects.toThrow(
                "No receiver address"
            );
        });

        it("should throw error when symbol is missing", async () => {
            const invalidParams = { ...validParams, symbol: "" };
            await expect(service.execute(invalidParams)).rejects.toThrow(
                "No symbol"
            );
        });

        it("should call getHbarBalance with correct address", async () => {
            mockGetHbarBalance.mockResolvedValue(100);

            await service.execute(validParams);

            expect(mockGetHbarBalance).toHaveBeenCalledWith(
                validParams.address
            );
        });

        it("should return correct balance response", async () => {
            const expectedBalance = 150;
            mockGetHbarBalance.mockResolvedValue(expectedBalance);

            const result = await service.execute(validParams);

            expect(result).toEqual({
                status: "success",
                balance: expectedBalance,
                unit: "HBAR",
            });
        });

        it("should handle errors from getHbarBalance", async () => {
            const testError = new Error("Balance query failed");
            mockGetHbarBalance.mockRejectedValue(testError);

            await expect(service.execute(validParams)).rejects.toThrow(
                testError
            );
        });
    });
});
