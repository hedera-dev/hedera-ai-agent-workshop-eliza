import {
    Action,
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type State,
} from "@elizaos/core";
import { hederaCreateNFTTokenTemplate } from "../../templates";
import { HederaProvider } from "../../providers/client";
import { CreateNftActionService } from "./services/create-nft-action-service.ts";
import { createNFTTokenParamsSchema } from "./schema.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { createNFTDetailsDescription } from "./utils.ts";

export const createNFTTokenAction: Action = {
    name: "HEDERA_CREATE_NFT_TOKEN",
    description: "Create a new non-fungible token (NFT) on the Hedera network",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback,
    ) => {
        try {
            const hederaCreateNFTTokenContext = composeContext({
                state: state,
                template: hederaCreateNFTTokenTemplate,
                templatingEngine: "handlebars",
            });

            const hederaCreateNFTTokenContent = await generateObjectDeprecated({
                runtime: runtime,
                context: hederaCreateNFTTokenContext,
                modelClass: ModelClass.SMALL,
            });

            console.log(
                `Extracted data: ${JSON.stringify(hederaCreateNFTTokenContent, null, 2)}`,
            );

            const createTokenData = createNFTTokenParamsSchema.parse(
                hederaCreateNFTTokenContent,
            );

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE",
            ) as HederaNetworkType;

            const createTokenService = new CreateNftActionService(hederaProvider);

            const response = await createTokenService.execute(createTokenData);

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);

                await callback({
                    text: `Created new NFT token with id: ${response.tokenId.toString()}\n\nDetails:${createNFTDetailsDescription(createTokenData)}\n\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error during token creation:", error);

            await callback({
                text: `Error during token creation: ${error.message}`,
                content: { error: error.message },
            });

            return false;
        }
    },
    validate: async (runtime) => {
        const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
        const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
        const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");

        return !!(privateKey && accountAddress && selectedNetworkType);
    },
    examples: [
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create a new NFT token called {{MyNFT}} with symbol {{NFT}}, and a maximum supply of {{100}}. Add metadata: 'This is a test NFT token' and memo 'memo for NFT'.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create an NFT token named {{UniqueArt}} with symbol {{ART}} and a maximum supply of {{50}}. Set the metadata key to true and provide a memo: 'Unique art of the future' for it.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Deploy an NFT token called {{GamingItem}} with symbol {{GI}} and a maximum supply of {{1000}}. I want to set the admin key to manage the token later.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Launch a new NFT token named {{ArtCollectible}} with symbol {{ARTC}} and a maximum supply of {{10}}. Set the metadata and admin keys. Do not set the memo or metadata.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create a new NFT token called {{ExclusiveItem}} with symbol {{EI}} and a maximum supply of {{5}}. This token will have a metadata key, and no admin key or memo.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create an NFT token named {{LimitedEditionNFT}} with the symbol {{LENFT}} and a maximum supply of {{100}}. No admin or metadata key, and no memo required.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create a new NFT token called {{ArtPiece}} with symbol {{AP}}, a maximum supply of {{20}}, and add a memo for the launch.",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_NFT_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_NEW_TOKEN",
        "HEDERA_CREATE_NEW_TOKEN",
        "HEDERA_NEW_FUNGIBLE_TOKEN",
    ],
};
