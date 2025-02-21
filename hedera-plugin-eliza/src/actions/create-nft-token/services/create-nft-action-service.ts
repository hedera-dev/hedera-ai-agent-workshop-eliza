import { CreateNFTTokenParams } from "../types.ts";
import { HederaProvider } from "../../../providers/client";
import { CreateTokenResult } from "hedera-agent-kit/src/types";
import { CreateNFTOptions } from "hedera-agent-kit";

export class CreateNftActionService  {
    constructor(private hederaProvider: HederaProvider) {}

    async execute(params: CreateNFTTokenParams): Promise<CreateTokenResult> {
        if (!params.name) {
            throw new Error("Missing name of token");
        }

        if (!params.symbol) {
            throw new Error("Missing symbol of token");
        }

        const agentKit = this.hederaProvider.getHederaAgentKit();

        const options: CreateNFTOptions = {
            name: params.name,
            symbol: params.symbol,
            maxSupply: params.maxSupply, // NFT tokens always have decimals 0 so no parsing to base unit is needed
            isMetadataKey: params.isMetadataKey,
            isAdminKey: params.isMetadataKey,
            tokenMetadata: new TextEncoder().encode(params.tokenMetadata),
            memo: params.memo
        }

        return agentKit.createNFT(
            options
        );
    }
}
