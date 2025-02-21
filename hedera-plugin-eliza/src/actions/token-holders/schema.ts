import { z } from "zod";

export const hederaTokenHoldersParamsSchema = z.object({
    tokenId: z.string(),
    threshold: z.coerce.number().optional(),
});
