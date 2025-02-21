import { HederaProvider } from "../../../providers/client";
import { AccountId, PendingAirdropId, TokenId } from "@hashgraph/sdk";
import { ClaimAirdropData } from "../types.ts";
import { ClaimAirdropResult } from "hedera-agent-kit/src/types";

export class ClaimAirdropService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: ClaimAirdropData,
        accountId: string
    ): Promise<ClaimAirdropResult> {
        if (!params.tokenId) {
            throw new Error("No tokenId provided");
        }

        if (!params.senderId) {
            throw new Error("No senderId provided");
        }

        if (!accountId) {
            throw new Error("No accountId provided");
        }

        const tokenId = TokenId.fromString(params.tokenId);
        const senderId = AccountId.fromString(params.senderId);
        const receiverId = AccountId.fromString(accountId);

        const pendingAirdrop = new PendingAirdropId({
            senderId,
            tokenId,
            receiverId,
        });

        const agentKit = this.hederaProvider.getHederaAgentKit();

        return agentKit.claimAirdrop(pendingAirdrop);
    }
}
