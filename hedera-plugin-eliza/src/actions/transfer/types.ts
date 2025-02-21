import { transferDataParamsSchema } from "./schema.ts";
import { z } from "zod";

export type HederaTransferParams = z.infer<typeof transferDataParamsSchema>
