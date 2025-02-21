import { HederaProvider } from "../../../providers/client";
import { AssetAllowanceResult, HederaAgentKit } from "hedera-agent-kit";
import {
    HederaSetSpendingApprovalParams,
} from "../types.ts";
import { AccountId, TokenId } from "@hashgraph/sdk";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { toBaseUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";

export class SetSpendingApprovalTokenAction {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaSetSpendingApprovalParams,
        networkType: HederaNetworkType,
    ): Promise<AssetAllowanceResult> {
        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        let parsedAmount = params.amount;
        if (params.tokenId) {
            parsedAmount = await toBaseUnit(params.tokenId, params.amount, networkType).then(
                (a) => a.toNumber(),
            );
        }

        const parsedTokenId = params.tokenId ? TokenId.fromString(params.tokenId) : undefined;

        return await agentKit.approveAssetAllowance(
            AccountId.fromString(params.spenderAccountId),
            parsedAmount,
            parsedTokenId,
        );
    }
}
