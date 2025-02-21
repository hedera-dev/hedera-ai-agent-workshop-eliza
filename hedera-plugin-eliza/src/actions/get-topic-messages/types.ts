import { z } from "zod";
import { hederaGetTopicMessagesParamsSchema } from "./schema.ts";
import { TxStatus } from "../../shared/constants.ts";
import { HCSMessage } from "hedera-agent-kit/dist/types";

export type HederaGetTopicMessagesParams = z.infer<
    typeof hederaGetTopicMessagesParamsSchema
>;

export type GetTopicMessagesResult = {
    status: TxStatus;
    messages: Array<HCSMessage>;
};
