import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import {
    GetTopicMessagesResult,
    HederaGetTopicMessagesParams,
} from "../types.ts";
import { TopicId } from "@hashgraph/sdk";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { convertStringToTimestamp } from "../../../shared/utils.ts";
import { TxStatus } from "../../../shared/constants.ts";

export class GetTopicMessageActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaGetTopicMessagesParams,
        networkType: HederaNetworkType
    ): Promise<GetTopicMessagesResult> {
        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        const result = await agentKit.getTopicMessages(
            TopicId.fromString(params.topicId),
            networkType,
            convertStringToTimestamp(params.lowerThreshold),
            convertStringToTimestamp(params.upperThreshold)
        );

        return {
            status: TxStatus.SUCCESS,
            messages: result,
        };
    }
}
