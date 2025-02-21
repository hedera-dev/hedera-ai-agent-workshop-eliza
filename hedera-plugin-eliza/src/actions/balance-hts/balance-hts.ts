import {
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";
import { hederaHtsBalanceParamsSchema } from "./schema.ts";
import { HederaProvider } from "../../providers/client";
import { HtsBalanceActionService } from "./services/hts-balance-action-service.ts";
import { HederaHtsBalanceParams, IHtsBalanceResponse } from "./types.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { balanceHtsTemplate } from "../../templates";

export const balanceHtsAction = {
    name: "HEDERA_HTS_BALANCE",
    description: "Returns provided HTS token balance for requested wallet",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const hederaHtsBalanceContext = composeContext({
            state: state,
            template: balanceHtsTemplate,
            templatingEngine: "handlebars",
        });

        const hederaHtsBalanceContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaHtsBalanceContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaHtsBalanceParams = {
            tokenId: hederaHtsBalanceContent.tokenId,
            address: hederaHtsBalanceContent.address,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaHtsBalanceParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                throw new Error(
                    `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
                );
            }

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new HtsBalanceActionService(hederaProvider);

            const response: IHtsBalanceResponse = await action.execute(
                paramOptions,
                networkType
            );

            if (callback && response.status === TxStatus.SUCCESS) {
                await callback({
                    text: `Address ${paramOptions.address} has balance of token ${response.unit} equal ${response.balance} ${response.symbol} (token id: ${paramOptions.tokenId})`,
                    content: {
                        success: true,
                        amount: response.balance,
                        address: paramOptions.address,
                        symbol: response.unit,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error(
                "Error during fetching HTS token balance:",
                error
            );

            if (callback) {
                await callback({
                    text: `Error during fetching HTS token balance: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: balanceHtsTemplate,
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
                    text: "Show me balance of token {{0.0.5424086}} for wallet {{0.0.5423981}}",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Whats {{0.0.5422544}} balance for wallet {{0.0.5423981}}",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me balance of hts-token with id 0.0.5422268 for wallet 0.0.5423949. Call HEDERA_HTS_BALANCE action",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me balance of hts token with id {{0.0.5422268}} for wallet {{0.0.5423949}}.",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HTS_BALANCE",
                },
            },
        ],
    ],
    similes: ["HTS_BALANCE", "HTS_AMOUNT", "HTS_BALANCE_HEDERA"],
};
