import { z } from "zod";

export const hederaMintNFTTokenParamsSchema = z.object({
    tokenId: z.string(),
    tokenMetadata: z.string()
});
