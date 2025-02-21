import { z } from "zod";

export const airdropTokenParamsSchema = z.object({
    tokenId: z.string(),
    recipients: z.array(z.string()),
    amount: z.coerce.number(),
});
