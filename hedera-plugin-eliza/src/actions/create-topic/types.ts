import { z } from "zod";
import { createTopicParamsSchema } from "./schema.ts";

export type CreateTopicParams = z.infer<typeof createTopicParamsSchema>;
