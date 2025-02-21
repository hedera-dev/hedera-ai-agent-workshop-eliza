import { z } from "zod";
import { hederaSetSpendingApprovalParamsSchema } from "./schema.ts";

export type HederaSetSpendingApprovalParams = z.infer<
    typeof hederaSetSpendingApprovalParamsSchema
>;
