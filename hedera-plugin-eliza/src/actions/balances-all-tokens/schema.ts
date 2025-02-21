import { z } from "zod";

export const hederaAllTokensBalancesParamsSchema = z.object({
    address: z.string().optional().nullable(),
});
