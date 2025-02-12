import { z } from "zod";

export const deleteTopicParamsSchema = z.object({
    topicId: z.string(),
});
