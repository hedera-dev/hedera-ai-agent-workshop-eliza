import { z } from "zod";
import { castToBoolean, castToNull } from "../../shared/utils.ts";

export const createNFTTokenParamsSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    maxSupply: z
        .union([z.string(), z.number()])
        .optional()
        .nullable()
        .transform(castToNull)
        .transform((value) => {
            if (value === null) {
                return null;
            }
            return Number(value);
        }),
    isMetadataKey: castToBoolean,
    isAdminKey: castToBoolean,
    tokenMetadata: z.string().optional().nullable().transform(castToNull),
    memo: z.string().optional().nullable().transform(castToNull),
});
