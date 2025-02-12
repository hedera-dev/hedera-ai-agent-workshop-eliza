import { z } from "zod";

export const hederaGetTopicMessagesParamsSchema = z.object({
    topicId: z.string(),
    lowerThreshold: z.string().nullable(),
    upperThreshold: z.string().nullable(),
});
