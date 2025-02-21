import { z } from "zod";

export const claimAirdropParamsSchema = z.object({
    senderId: z.string(),
    tokenId: z.string(),
});
