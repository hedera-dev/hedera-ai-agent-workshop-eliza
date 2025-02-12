import { z } from "zod";

export const hederaAssociateTokenParamsSchema = z.object({
    tokenId: z.string(),
});

