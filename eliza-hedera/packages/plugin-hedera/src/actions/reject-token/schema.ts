import { z } from "zod";

export const hederaRejectTokenParamsSchema = z.object({
    tokenId: z.string(),
});
