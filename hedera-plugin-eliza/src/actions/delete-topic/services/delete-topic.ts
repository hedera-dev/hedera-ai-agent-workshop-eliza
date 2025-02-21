import { HederaProvider } from "../../../providers/client";
import { DeleteTopicParams } from "../types.ts";
import { TopicId } from "@hashgraph/sdk";
import { DeleteTopicResult } from "hedera-agent-kit/dist/types";

export class DeleteTopicService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(params: DeleteTopicParams): Promise<DeleteTopicResult> {
        if (!params.topicId) {
            throw new Error("Missing topicId");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();
        const topicId = TopicId.fromString(params.topicId);

        return agentKit.deleteTopic(topicId);
    }
}
