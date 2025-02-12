import { transferTokenParamsSchema } from "./schema.ts";
import { z } from "zod";

export type TransferTokenParams = z.infer<typeof transferTokenParamsSchema>;
