import { z } from "zod";
import { hederaMintNFTTokenParamsSchema } from "./schema.ts";

export type HederaMintNFTTokenParams = z.infer<typeof hederaMintNFTTokenParamsSchema>;
