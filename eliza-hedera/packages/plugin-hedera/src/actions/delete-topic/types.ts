import { deleteTopicParamsSchema } from "./schema.ts";
import { z } from "zod";

export type DeleteTopicParams = z.infer<typeof deleteTopicParamsSchema>;
