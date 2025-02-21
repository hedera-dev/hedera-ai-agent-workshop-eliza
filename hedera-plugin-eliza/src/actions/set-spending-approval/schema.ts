import { z } from "zod";

export const hederaSetSpendingApprovalParamsSchema = z.object({
    spenderAccountId: z.string(),
    amount: z.coerce.number(),
    tokenId: z.string().nullable().optional(),
});
