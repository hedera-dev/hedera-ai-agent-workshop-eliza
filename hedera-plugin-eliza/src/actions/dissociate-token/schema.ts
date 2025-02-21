import { z } from "zod";

export const hederaDissociateTokenParamsSchema = z.object({
    tokenId: z.string(),
});
