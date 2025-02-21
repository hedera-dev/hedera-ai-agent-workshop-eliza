import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import { HederaTokenHoldersParams, TokenHoldersResult } from "../types.ts";
import {
    HederaNetworkType,
    HtsTokenDetails,
    TokenBalance,
} from "hedera-agent-kit/src/types";
import { toBaseUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";
import { TxStatus } from "../../../shared/constants.ts";

export class TokenHoldersActionService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaTokenHoldersParams,
        networkType: HederaNetworkType
    ): Promise<TokenHoldersResult> {
        if (!params.tokenId) {
            throw new Error("No token id provided!");
        }

        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();

        const thresholdBaseUnit = params.threshold
            ? await toBaseUnit(
                  params.tokenId,
                  params.threshold,
                  networkType
              ).then((num) => num.toNumber())
            : undefined;

        const balancesArray: Array<TokenBalance> =
            await agentKit.getTokenHolders(
                params.tokenId,
                networkType,
                thresholdBaseUnit
            );

        const tokenDetails: HtsTokenDetails = await agentKit.getHtsTokenDetails(
            params.tokenId,
            networkType
        );

        return {
            status: TxStatus.SUCCESS,
            tokenId: params.tokenId,
            tokenName: tokenDetails.name,
            tokenSymbol: tokenDetails.symbol,
            tokenDecimals: Number(tokenDetails.decimals),
            holdersArray: balancesArray,
        } as TokenHoldersResult;
    }
}
