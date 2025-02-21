import { z } from "zod";

export const hederaMintTokenParamsSchema = z.object({
    tokenId: z.string(),
    amount: z.coerce.number(),
});
