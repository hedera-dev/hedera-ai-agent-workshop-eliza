import { z } from "zod";
import { hederaMintTokenParamsSchema } from "./schema.ts";

export type HederaMintTokenParams = z.infer<typeof hederaMintTokenParamsSchema>;
