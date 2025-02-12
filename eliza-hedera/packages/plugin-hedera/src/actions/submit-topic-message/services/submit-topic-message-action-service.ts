import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import { SubmitMessageResult } from "hedera-agent-kit/src/types";
import { HederaSubmitTopicMessageParams } from "../types.ts";
import { TopicId } from "@hashgraph/sdk";

export class SubmitTopicMessageActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaSubmitTopicMessageParams
    ): Promise<SubmitMessageResult> {
        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        return agentKit.submitTopicMessage(
            TopicId.fromString(params.topicId),
            params.message
        );
    }
}
