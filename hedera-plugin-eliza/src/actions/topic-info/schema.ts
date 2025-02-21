import { z } from "zod";

export const hederaTopicInfoParamsSchema = z.object({
    topicId: z.string(),
});
