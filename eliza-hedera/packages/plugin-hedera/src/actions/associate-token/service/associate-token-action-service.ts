import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import { HederaAssociateTokenParams } from "../types.ts";
import { AssociateTokenResult } from "hedera-agent-kit/src/types";
import { TokenId } from "@hashgraph/sdk";

export class AssociateTokenActionService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaAssociateTokenParams
    ): Promise<AssociateTokenResult> {
        if (!params.tokenId) {
            throw new Error("No token id");
        }

        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        return await agentKit.associateToken(
            TokenId.fromString(params.tokenId)
        );
    }
}
