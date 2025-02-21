import type { HederaHtsBalanceParams } from "../types.ts";
import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import { TokenId } from "@hashgraph/sdk";
import { RejectTokenResult } from "hedera-agent-kit/src/types";

export class RejectTokenActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(params: HederaHtsBalanceParams): Promise<RejectTokenResult> {
        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        return await agentKit.rejectToken(TokenId.fromString(params.tokenId));
    }
}
