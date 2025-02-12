import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import { HederaDissociateTokenParams } from "../types.ts";
import { AssociateTokenResult } from "hedera-agent-kit/src/types";
import { TokenId } from "@hashgraph/sdk";

export class DissociateTokenActionService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaDissociateTokenParams
    ): Promise<AssociateTokenResult> {
        if (!params.tokenId) {
            throw new Error("No token id");
        }

        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        return await agentKit.dissociateToken(
            TokenId.fromString(params.tokenId)
        );
    }
}
