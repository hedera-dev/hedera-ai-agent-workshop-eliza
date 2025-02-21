import type {
    HederaHbarBalanceParams,
    IHbarBalanceResponse,
} from "../types.ts";
import { HederaProvider } from "../../../providers/client";
import { HederaAgentKit } from "hedera-agent-kit";
import { TxStatus } from "../../../shared/constants.ts";

export class HbarBalanceActionService {
    constructor(private hederaProvider: HederaProvider) {
        this.hederaProvider = hederaProvider;
    }

    async execute(
        params: HederaHbarBalanceParams
    ): Promise<IHbarBalanceResponse> {
        if (!params.address) {
            throw new Error("No receiver address");
        }

        if (!params.symbol) {
            throw new Error("No symbol");
        }

        const agentKit: HederaAgentKit =
            this.hederaProvider.getHederaAgentKit();
        const balance = await agentKit.getHbarBalance(params.address);

        return {
            status: TxStatus.SUCCESS,
            balance: balance,
            unit: "HBAR",
        };
    }
}
