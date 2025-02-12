import { z } from "zod";

export const transferTokenParamsSchema = z.object({
    tokenId: z.string(),
    toAccountId: z.string(),
    amount: z.coerce.number(),
});
