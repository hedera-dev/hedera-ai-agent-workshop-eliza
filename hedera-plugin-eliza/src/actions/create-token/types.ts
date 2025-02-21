import { z } from "zod";
import { createTokenParamsSchema } from "./schema.ts";

export type CreateTokenParams = z.infer<typeof createTokenParamsSchema>
