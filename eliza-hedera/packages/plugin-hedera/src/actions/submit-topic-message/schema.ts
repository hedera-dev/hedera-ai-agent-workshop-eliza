import { z } from "zod";

export const hederaSubmitTopicMessageParamsSchema = z.object({
    topicId: z.string(),
    message: z.string(),
});
