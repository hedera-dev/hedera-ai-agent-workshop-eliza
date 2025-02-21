import { HederaProvider } from "../../../providers/client";
import { HederaTransferParams } from "../types.ts";
import { TransferHBARResult } from "hedera-agent-kit/src/types";

export class TransferHbarService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute({
        amount,
        accountId,
    }: HederaTransferParams): Promise<TransferHBARResult> {
        if (!amount) {
            throw new Error("Missing amount");
        }

        if (!accountId) {
            throw new Error("Missing recipient accountId");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();
        return agentKit.transferHbar(accountId, amount);
    }
}
