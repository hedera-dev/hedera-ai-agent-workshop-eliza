import { z } from "zod";
import { hederaRejectTokenParamsSchema } from "./schema.ts";

export type HederaHtsBalanceParams = z.infer<
    typeof hederaRejectTokenParamsSchema
>;
