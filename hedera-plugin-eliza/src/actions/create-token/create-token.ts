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
import { hederaCreateTokenTemplate } from "../../templates";
import { HederaProvider } from "../../providers/client";
import { CreateTokenService } from "./services/create-token.ts";
import { createTokenParamsSchema } from "./schema.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { createFTDetailsDescription } from "./utils.ts";

export const createTokenAction: Action = {
    name: "HEDERA_CREATE_TOKEN",
    description: "Create a new fungible token on the Hedera network",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback
    ) => {
        try {
            const hederaCreateTokenContext = composeContext({
                state: state,
                template: hederaCreateTokenTemplate,
                templatingEngine: "handlebars",
            });

            const hederaCreateTokenContent = await generateObjectDeprecated({
                runtime: runtime,
                context: hederaCreateTokenContext,
                modelClass: ModelClass.SMALL,
            });

            const createTokenData = createTokenParamsSchema.parse(
                hederaCreateTokenContent
            );

            console.log(
                `Extracted data: ${JSON.stringify(createTokenData, null, 2)}`
            );

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const createTokenService = new CreateTokenService(hederaProvider);

            const response = await createTokenService.execute(createTokenData);

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: [
                        `Created a new fungible token!`,
                        `Token ID: ${response.tokenId.toString()}`,
                        ``,
                        `Details:`,
                        `${createFTDetailsDescription(createTokenData)}`,
                        ``,
                        `Transaction link: ${url}`
                    ].join("\n"),
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
                    text: "Create new token with name {{MyToken}} with symbol {{MTK}}, {{8}} decimals and {{1000}} initial supply.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create a new token named {{HederaDollar}} with ticker {{H$}}, {{4}} decimals, and {{1000000}} initial supply. I want to set the supply key so I could add more tokens later.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create token {{GameGold}} with symbol {{GG}}, {{2}} decimal places, and starting supply of {{750000}}. This is the final supply, don’t set a supply key.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Deploy a token named {{SuperToken}} with short code {{STK}}, {{5}} decimal places, and an issuance of {{100000}}. No additional tokens will be minted.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Create new HTS token {{PixelCoin}} with symbol {{PXN}}, {{3}} decimal places, and {{500}} tokens minted. I want to control supply changes, so set the supply key.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Launch a new HTS token called {{SkyCredits}} with ticker {{SKC}}, {{9}} decimal places, and a total supply of {{25000}}. The supply is fixed.",
                    action: "HEDERA_CREATE_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_CREATE_TOKEN",
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
