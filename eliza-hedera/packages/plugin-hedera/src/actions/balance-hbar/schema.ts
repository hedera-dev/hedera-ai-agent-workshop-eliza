import { z } from "zod";

export const hederaHbarBalanceParamsSchema = z.object({
    symbol: z.string(),
    address: z.string(),
});
