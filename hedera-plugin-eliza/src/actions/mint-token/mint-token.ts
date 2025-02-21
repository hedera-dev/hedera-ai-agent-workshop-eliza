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
import { MintTokenActionService } from "./services/mint-token-action-service.ts";
import { HederaMintTokenParams } from "./types.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { MintTokenResult } from "hedera-agent-kit/src/types";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { hederaMintTokenParamsSchema } from "./schema.ts";
import { mintTokenTemplate } from "../../templates";

export const mintTokenAction = {
    name: "HEDERA_MINT_TOKEN",
    description: "Action allowing minting fungible tokens",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const hederaMintTokenContext = composeContext({
            state: state,
            template: mintTokenTemplate,
            templatingEngine: "handlebars",
        });

        const hederaMintTokenContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaMintTokenContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaMintTokenParams = {
            tokenId: hederaMintTokenContent.tokenId,
            amount: hederaMintTokenContent.amount,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaMintTokenParamsSchema.safeParse(paramOptions);

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

            const action = new MintTokenActionService(hederaProvider);

            const response: MintTokenResult = await action.execute(
                paramOptions,
                networkType
            );

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Successfully minted ${paramOptions.amount} of tokens ${paramOptions.tokenId}\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error during minting tokens. Error:", error);

            if (callback) {
                await callback({
                    text: `Error during minting tokens. Error: ${error.message}`,
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
                    text: "Mint 2500 tokens 0.0.999888",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Generate 150 tokens 0.0.567123",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create and distribute 4000 tokens with id 0.0.333222",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Mint exactly 999 tokens 0.0.741852",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "HEDERA_MINT_TOKEN: Issue 5000 tokens 0.0.852963",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_MINT_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_MINT_TOKEN_ACTION",
        "HEDERA_MINT_FUNGIBLE_TOKEN",
        "HCS_MINT_TOKEN",
    ],
};
