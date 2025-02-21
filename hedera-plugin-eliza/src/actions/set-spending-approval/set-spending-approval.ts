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
import { HederaSetSpendingApprovalParams } from "./types.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { hederaSetSpendingApprovalParamsSchema } from "./schema.ts";
import { SetSpendingApprovalTokenAction } from "./services/set-spending-approval-action-service.ts";
import { getSpendingAllowanceTemplate, getTopicMessagesTemplate } from "../../templates";

export const setSpendingApprovalAction = {
    name: "HEDERA_SET_SPENDING_APPROVAL",
    description:
        "Action for setting spending approval for HBAR or fungible tokens",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback,
    ) => {
        const hederaGetTopicMessagesContext = composeContext({
            state: state,
            template: getSpendingAllowanceTemplate,
            templatingEngine: "handlebars",
        });

        const hederaSetSpedingApprovalContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaGetTopicMessagesContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaSetSpendingApprovalParams = {
            spenderAccountId: hederaSetSpedingApprovalContent.spenderAccountId,
            amount: hederaSetSpedingApprovalContent.amount,
            tokenId: hederaSetSpedingApprovalContent.tokenId,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`,
        );

        try {
            const validationResult =
                hederaSetSpendingApprovalParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map(
                    (e) =>
                        `Field "${e.path.join(".")}" failed validation: ${e.message}`,
                );
                throw new Error(
                    `Error during parsing data from users prompt: ${errorMessages.join(", ")}`,
                );
            }

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE",
            ) as HederaNetworkType;

            const action = new SetSpendingApprovalTokenAction(hederaProvider);

            const response = await action.execute(paramOptions, networkType);

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                const token = paramOptions.tokenId ? paramOptions.tokenId : "HBAR";
                await callback({
                    text: `Successfully set the spending approval of ${paramOptions.amount} of tokens ${token} for the account ${paramOptions.spenderAccountId}.\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error setting the spending approval. Error:", error);

            if (callback) {
                await callback({
                    text: `Error setting the spending approval. Error: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: getTopicMessagesTemplate,
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
                    text: "Set spending approval for an account {{0.0.123456}} for 123 HBAR.",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Set spending approval for an account {{0.0.123456}} for 123 tokens {{0.0.2222222}}.",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Set spending approval of 123 tokens {{0.0.2222222}} for an account {{0.0.123456}}.",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_SET_SPENDING_APPROVAL",
                },
            },
        ],
    ],

    similes: [
        "HEDERA_SET_SPENDING_APPROVAL_HBAR",
        "HEDERA_SET_SPENDING_APPROVAL_HTS",
    ],
};
