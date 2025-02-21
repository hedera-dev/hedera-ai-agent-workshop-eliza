import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import {
    AllTokensBalancesResult,
    HederaAllTokensBalancesParams,
} from "../types.ts";
import {
    DetailedTokenBalance,
    HederaNetworkType,
} from "hedera-agent-kit/src/types";
import { TxStatus } from "../../../shared/constants.ts";

export class AllTokensBalancesActionService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: HederaAllTokensBalancesParams,
        networkType: HederaNetworkType
    ): Promise<AllTokensBalancesResult> {
        if (!params.address) {
            throw new Error("No receiver address");
        }

        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();
        const balancesArray: Array<DetailedTokenBalance> =
            await agentKit.getAllTokensBalances(networkType, params.address);

        return {
            status: TxStatus.SUCCESS,
            balancesArray: balancesArray,
        };
    }
}
