import {
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";
import type { HederaHbarBalanceParams, IHbarBalanceResponse } from "./types";
import { hederaHbarBalanceParamsSchema } from "./schema.ts";
import { HederaProvider } from "../../providers/client";
import { HbarBalanceActionService } from "./services/hbar-balance-action-service.ts";
import { TxStatus } from "../../shared/constants.ts";
import { balanceHbarTemplate } from "../../templates";

export const balanceHbarAction = {
    name: "HEDERA_HBAR_BALANCE",
    description: "Returns HBAR balance of requested wallet",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        _callback?: HandlerCallback
    ) => {
        const hederaHbarBalanceContext = composeContext({
            state: state,
            template: balanceHbarTemplate,
            templatingEngine: "handlebars",
        });

        const hederaHbarBalanceContent = await generateObjectDeprecated({
            runtime: _runtime,
            context: hederaHbarBalanceContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaHbarBalanceParams = {
            symbol: hederaHbarBalanceContent.symbol,
            address: hederaHbarBalanceContent.address,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaHbarBalanceParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                throw new Error(
                    `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
                );
            }

            const hederaProvider = new HederaProvider(_runtime);

            const action = new HbarBalanceActionService(hederaProvider);

            const response: IHbarBalanceResponse =
                await action.execute(paramOptions);

            if (_callback && response.status === TxStatus.SUCCESS) {
                await _callback({
                    text: `Address ${paramOptions.address} has balance of ${response.balance} HBAR`,
                    content: {
                        success: true,
                        amount: response.balance,
                        address: paramOptions.address,
                        symbol: "HBAR",
                    },
                });
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
    template: balanceHbarTemplate,
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
                    text: "Show me HBAR balance of wallet {{0.0.5423981}}",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Whats HBAR balance of wallet {{0.0.5423981}}",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me HBAR balance of wallet 0.0.5423949. Call HEDERA_HBAR_BALANCE action",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_HBAR_BALANCE",
                },
            },
        ],
    ],
    similes: ["HBAR_BALANCE"],
};
