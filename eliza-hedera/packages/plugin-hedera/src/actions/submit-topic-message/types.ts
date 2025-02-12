import { z } from "zod";
import { hederaSubmitTopicMessageParamsSchema } from "./schema.ts";

export type HederaSubmitTopicMessageParams = z.infer<
    typeof hederaSubmitTopicMessageParamsSchema
>;
