import { z } from "zod";

export const createTopicParamsSchema = z.object({
    memo: z.string(),
    isSubmitKey: z.coerce.boolean(),
});
