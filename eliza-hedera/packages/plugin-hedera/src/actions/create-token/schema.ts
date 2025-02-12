import { z } from "zod";

export const createTokenParamsSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.coerce.number(),
    initialSupply: z.coerce.number(),
    isSupplyKey: z.boolean(),
});
