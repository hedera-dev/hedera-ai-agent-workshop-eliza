import { z } from "zod";
import { castToBoolean, castToNull } from "../../shared/utils.ts";

export const createTokenParamsSchema = z.object({
    symbol: z.string(),
    name: z.string(),
    decimals: z.coerce.number(),
    initialSupply: z.coerce.number(),
    isSupplyKey: castToBoolean,
    isMetadataKey: castToBoolean,
    isAdminKey: castToBoolean,
    tokenMetadata: z.string().optional().nullable().transform(castToNull),
    memo: z.string().optional().nullable().transform(castToNull),
});
