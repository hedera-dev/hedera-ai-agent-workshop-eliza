import { HederaProvider } from "../../../providers/client";
import { AirdropRecipient, AirdropTokenParams } from "../types.ts";
import { TokenId } from "@hashgraph/sdk";
import { AirdropResult, HederaNetworkType } from "hedera-agent-kit/src/types";
import { toBaseUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";

export class AirdropTokenService {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(
        params: AirdropTokenParams,
        networkType: HederaNetworkType
    ): Promise<AirdropResult> {
        if (!params.tokenId) {
            throw new Error("Missing tokenId");
        }

        if (!params.recipients || !params.recipients.length) {
            throw new Error("Missing recipients");
        }

        if (!params.amount) {
            throw new Error("Missing amount to airdrop");
        }

        const tokenId = TokenId.fromString(params.tokenId);

        const recipients: AirdropRecipient[] = await Promise.all(
            params.recipients.map(async (r) => ({
                accountId: r,
                amount: (
                    await toBaseUnit(
                        tokenId.toString(),
                        params.amount,
                        networkType
                    )
                ).toNumber(),
            }))
        );

        const agentKit = this.hederaProvider.getHederaAgentKit();
        return await agentKit.airdropToken(tokenId, recipients);
    }
}
