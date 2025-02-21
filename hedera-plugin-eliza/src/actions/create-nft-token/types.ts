import { z } from "zod";
import { createNFTTokenParamsSchema } from "./schema.ts";

export type CreateNFTTokenParams = z.infer<typeof createNFTTokenParamsSchema>
