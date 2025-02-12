import { HederaProvider } from "../../../providers/client";
import { TransferTokenParams } from "../types.ts";
import { TokenId } from "@hashgraph/sdk";
import {
    TransferTokenResult,
    HederaNetworkType,
} from "hedera-agent-kit/src/types";
import { toBaseUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";

export class TransferTokenService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: TransferTokenParams,
        networkType: HederaNetworkType
    ): Promise<TransferTokenResult> {
        if (!params.tokenId) {
            throw new Error("Missing tokenId");
        }

        if (!params.toAccountId) {
            throw new Error("Missing recipient accountId");
        }

        if (!params.amount) {
            throw new Error("Missing amount of token");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();

        const tokenId = TokenId.fromString(params.tokenId);

        return agentKit.transferToken(
            tokenId,
            params.toAccountId,
            await toBaseUnit(params.tokenId, params.amount, networkType).then(
                (a) => a.toNumber()
            )
        );
    }
}
