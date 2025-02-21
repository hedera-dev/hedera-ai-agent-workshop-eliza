import { z } from "zod";
import { hederaTopicInfoParamsSchema } from "./schema.ts";

export type HederaTopicInfoParams = z.infer<
    typeof hederaTopicInfoParamsSchema
>;
