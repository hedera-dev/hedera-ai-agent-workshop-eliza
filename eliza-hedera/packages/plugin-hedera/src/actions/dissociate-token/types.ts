import { z } from "zod";
import { hederaDissociateTokenParamsSchema } from "./schema.ts";

export type HederaDissociateTokenParams = z.infer<
    typeof hederaDissociateTokenParamsSchema
>;
