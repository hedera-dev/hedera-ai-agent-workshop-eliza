import { z } from "zod";

export const hederaHtsBalanceParamsSchema = z.object({
    tokenId: z.string(),
    address: z.string(),
});
