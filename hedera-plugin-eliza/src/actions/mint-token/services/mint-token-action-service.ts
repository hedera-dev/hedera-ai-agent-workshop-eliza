import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import { MintTokenResult } from "hedera-agent-kit/src/types";
import { HederaMintTokenParams } from "../types.ts";
import { TokenId } from "@hashgraph/sdk";
import { toBaseUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";
import { HederaNetworkType } from "hedera-agent-kit/src/types";

export class MintTokenActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaMintTokenParams,
        networkType: HederaNetworkType
    ): Promise<MintTokenResult> {
        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        const baseUnitAmount = await toBaseUnit(
            params.tokenId,
            params.amount,
            networkType
        );

        return agentKit.mintToken(
            TokenId.fromString(params.tokenId),
            baseUnitAmount.toNumber()
        );
    }
}
