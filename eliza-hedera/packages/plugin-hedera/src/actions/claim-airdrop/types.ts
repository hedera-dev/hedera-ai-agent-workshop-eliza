import { claimAirdropParamsSchema } from "./schema.ts";
import { z } from "zod";

export type ClaimAirdropData = z.infer<typeof claimAirdropParamsSchema>;
