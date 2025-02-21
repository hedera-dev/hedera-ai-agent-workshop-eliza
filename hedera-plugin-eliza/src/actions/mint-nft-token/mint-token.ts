import {
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";
import { HederaProvider } from "../../providers/client";
import { MintNftActionService } from "./services/mint-nft-action-service.ts";
import { HederaMintNFTTokenParams } from "./types.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { MintTokenResult } from "hedera-agent-kit/src/types";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { hederaMintNFTTokenParamsSchema } from "./schema.ts";
import { mintNFTTokenTemplate, mintTokenTemplate } from "../../templates";

export const mintNFTTokenAction = {
    name: "HEDERA_MINT_NFT_TOKEN",
    description: "Action allowing minting non-fungible (NFT) tokens",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const hederaMintNFTTokenContext = composeContext({
            state: state,
            template: mintNFTTokenTemplate,
            templatingEngine: "handlebars",
        });

        const hederaMintNFTTokenContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaMintNFTTokenContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaMintNFTTokenParams = {
            tokenId: hederaMintNFTTokenContent.tokenId,
            tokenMetadata: hederaMintNFTTokenContent.tokenMetadata,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaMintNFTTokenParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map(
                    (e) =>
                        `Field "${e.path.join(".")}" failed validation: ${e.message}`
                );
                throw new Error(
                    `Error during parsing data from users prompt: ${errorMessages.join(", ")}`
                );
            }

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new MintNftActionService(hederaProvider);

            const response: MintTokenResult = await action.execute(
                paramOptions,
            );

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Successfully minted NFT ${paramOptions.tokenId}\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error during minting NFT. Error:", error);

            if (callback) {
                await callback({
                    text: `Error during minting NFT. Error: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: mintTokenTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
        const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
        const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");

        return !!(privateKey && accountAddress && selectedNetworkType);
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Mint NFT {{0.0.5478757}}. Set it's metadata to '{{https://example.com/nft-image.png}}'.",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Mint NFT with id {{0.0.5478757}}. Assign '{{https://example.com/nft-image.png}}' to its metadata.",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Mint NFT {{0.0.5512318}} with metadata '{{Testing this nft}}'",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_NFT_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_MINT_NFT_TOKEN_ACTION",
        "HEDERA_MINT_NON_FUNGIBLE_TOKEN",
        "HCS_MINT_NFT",
    ],
};
