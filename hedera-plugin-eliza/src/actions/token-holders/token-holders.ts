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
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { HederaTokenHoldersParams, TokenHoldersResult } from "./types.ts";
import { hederaTokenHoldersParamsSchema } from "./schema.ts";
import { TokenHoldersActionService } from "./services/token-holders-action-service.ts";
import { toDisplayUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";
import { TxStatus } from "../../shared/constants.ts";
import { tokenHoldersTemplate } from "../../templates";

export const tokenHoldersAction = {
    name: "HEDERA_TOKEN_HOLDERS",
    description:
        "Returns holders of provided token with their balances. Can accept optional parameter for filtering accounts with greater or equal amount of tokens.",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        _callback?: HandlerCallback
    ) => {
        const hederaTokenHoldersContext = composeContext({
            state: state,
            template: tokenHoldersTemplate,
            templatingEngine: "handlebars",
        });

        const hederaTokenHoldersContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaTokenHoldersContext,
            modelClass: ModelClass.MEDIUM,
        });

        const paramOptions: HederaTokenHoldersParams = {
            tokenId: hederaTokenHoldersContent.tokenId,
            threshold: hederaTokenHoldersContent.threshold,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaTokenHoldersParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                throw new Error(
                    `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
                );
            }

            const hederaProvider = new HederaProvider(runtime);

            const action = new TokenHoldersActionService(hederaProvider);

            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const result: TokenHoldersResult = await action.execute(
                paramOptions,
                networkType
            );

            let text = "";
            for (const holder of result.holdersArray) {
                const displayBalance = await toDisplayUnit(
                    result.tokenId,
                    holder.balance,
                    networkType
                ).then((b) => b.toString());
                text += `${holder.account}: ${displayBalance} ${result.tokenSymbol}\n`;
            }

            if (_callback && result.status === TxStatus.SUCCESS) {
                if (text === "") {
                    await _callback({
                        text: `Token ${paramOptions.tokenId} (${result.tokenName}) does not have any holders.`,
                        content: {
                            success: true,
                            holdersArray: result.holdersArray,
                            tokenId: paramOptions.tokenId,
                        },
                    });
                } else {
                    await _callback({
                        text: `Token ${paramOptions.tokenId} (${result.tokenName}) has following holders:\n${text}`,
                        content: {
                            success: true,
                            holdersArray: result.holdersArray,
                            tokenId: paramOptions.tokenId,
                        },
                    });
                }
            }
            return true;
        } catch (error) {
            console.error("Error during fetching balance:", error);

            if (_callback) {
                await _callback({
                    text: `Error during fetching balance: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: tokenHoldersTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
        const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
        const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");

        return !!(privateKey && accountAddress && selectedNetworkType);
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Who owns token {{0.0.54321}} and what are their balances?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you show me the token holders for {{0.0.987654}}?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Give me a list of wallets holding token {{0.0.246810}}.",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Which wallets have token {{0.0.13579}} and how many tokens do they hold?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me the balance of token {{0.0.987654}} across all wallets.",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Who holds token {{0.0.864209}} and how much of it do they have?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What is the token holder distribution for token {{0.0.123456}}?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please provide the details of wallets holding token {{0.1.112233}}.",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me the token holders for {{0.0.123456}} with balances greater or equal 1000.",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Which wallets hold token {{0.0.654321}} and have at least 5000 tokens?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Give me a list of wallets holding token {{0.0.111111}} with minimum 100 tokens.",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you provide details of wallets owning token {{0.0.222222}} with balances equal or above 2000?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Who holds token {{0.0.333333}} and has a balance greater than or equal 10000?",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Find wallets with token {{0.0.444444}} that have at least 500 tokens.",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Who owns token {{0.0.555555}}? Only show wallets with at least 750 tokens.",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOKEN_HOLDERS",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_TOKEN_HOLDERS_BY_THRESHOLD",
        "HEDERA_ALL_TOKEN_HOLDERS",
        "HEDERA_HTS_HOLDERS",
    ],
};
