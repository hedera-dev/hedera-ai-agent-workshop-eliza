import { z } from "zod";

export const hederaTokenHoldersParamsSchema = z.object({
    tokenId: z.string(),
    threshold: z.number().optional(),
});
