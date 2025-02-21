import {
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";
import {
    AllTokensBalancesResult,
    HederaAllTokensBalancesParams,
} from "./types";
import { hederaAllTokensBalancesParamsSchema } from "./schema.ts";
import { HederaProvider } from "../../providers/client";
import { AllTokensBalancesActionService } from "./services/all-tokens-balances-action-service.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { balancesAllTokensTemplate } from "../../templates";

export const balancesAllTokensAction = {
    name: "HEDERA_ALL_BALANCES",
    description:
        "Returns balances of all tokens for requested wallet or agent's wallet if no specific wallet provided",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        _callback?: HandlerCallback
    ) => {
        const hederaAllTokensBalancesContext = composeContext({
            state: state,
            template: balancesAllTokensTemplate,
            templatingEngine: "handlebars",
        });

        const hederaAllTokensBalancesContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaAllTokensBalancesContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaAllTokensBalancesParams = {
            address: hederaAllTokensBalancesContent.address,
        };

        try {
            const validationResult =
                hederaAllTokensBalancesParamsSchema.safeParse(paramOptions);

            console.log(
                `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
            );

            if (!validationResult.success) {
                throw new Error(
                    `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
                );
            }

            // fallback as LLM model sometimes fails to extract connected wallet account id from agent's state
            if (!paramOptions.address) {
                console.warn(
                    `LLM couldn't extract agent's wallet from state. Manually assigning connected wallet address.`
                );
                paramOptions.address = runtime.getSetting("HEDERA_ACCOUNT_ID");
            }

            const hederaProvider = new HederaProvider(runtime);

            const action = new AllTokensBalancesActionService(hederaProvider);

            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const response: AllTokensBalancesResult = await action.execute(
                paramOptions,
                networkType
            );

            let text = "";
            for (const balance of response.balancesArray) {
                text += `${balance.tokenName}: ${balance.balanceInDisplayUnit} ${balance.tokenSymbol} (${balance.tokenId})\n`;
            }

            if (_callback && response.status === TxStatus.SUCCESS) {
                if (text === "") {
                    await _callback({
                        text: `Address ${paramOptions.address} does not have any token balances.`,
                        content: {
                            success: true,
                            amount: response.balancesArray,
                            address: paramOptions.address,
                        },
                    });
                } else {
                    await _callback({
                        text: `Address ${paramOptions.address} has following token balances:\n${text}`,
                        content: {
                            success: true,
                            amount: response.balancesArray,
                            address: paramOptions.address,
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
    template: balancesAllTokensTemplate,
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
                    text: "Show me the token balances for wallet {{0.1.123123}}.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me the balances of all HTS tokens for wallet {{0.0.123123}}.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are the HTS token balances for wallet {{0.0.123123}}?",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are your HTS token balances?",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me your HTS token balances.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you display all token balances for wallet {{0.0.543210}}?",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I need the HTS token balances for wallet {{0.0.987654}}.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Retrieve all HTS token balances for account {{0.0.135790}}.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please fetch the HTS token balances for wallet {{0.0.246802}}.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Get the token balances for the account {{0.0.112233}}.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you show me all token balances associated with wallet {{0.0.556677}}?",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Fetch the HTS token balances for account ID {{0.0.778899}}.",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ALL_BALANCES",
                },
            },
        ],
    ],
    similes: ["ALL_TOKENS_BALANCE"],
};
