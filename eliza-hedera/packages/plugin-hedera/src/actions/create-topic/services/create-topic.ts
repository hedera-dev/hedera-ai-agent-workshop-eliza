import { CreateTopicResult } from "hedera-agent-kit/src/types";
import { HederaProvider } from "../../../providers/client";
import { CreateTopicParams } from "../types.ts";

export class CreateTopicService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(params: CreateTopicParams): Promise<CreateTopicResult> {
        if (!params.memo) {
            throw new Error("Missing memo of new topic");
        }
        if (params.isSubmitKey === null) {
            params.isSubmitKey = false;
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();

        return agentKit.createTopic(params.memo, params.isSubmitKey);
    }
}
