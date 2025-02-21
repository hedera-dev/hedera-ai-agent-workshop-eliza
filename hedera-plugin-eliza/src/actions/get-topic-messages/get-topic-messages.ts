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
import { HederaGetTopicMessagesParams } from "./types.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { convertTimestampToUTC } from "../../shared/utils.ts";
import { hederaGetTopicMessagesParamsSchema } from "./schema.ts";
import { GetTopicMessageActionService } from "./services/get-topic-messages-action-service.ts";
import { getTopicMessagesTemplate } from "../../templates";

export const getTopicMessagesAction = {
    name: "HEDERA_GET_TOPIC_MESSAGES",
    description:
        "Action for fetching messages from a topic by its ID, with the option to filter messages by upper and lower thresholds.",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const hederaGetTopicMessagesContext = composeContext({
            state: state,
            template: getTopicMessagesTemplate,
            templatingEngine: "handlebars",
        });

        const hederaGetTopicMessagesContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaGetTopicMessagesContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaGetTopicMessagesParams = {
            topicId: hederaGetTopicMessagesContent.topicId,
            lowerThreshold: hederaGetTopicMessagesContent.lowerThreshold,
            upperThreshold: hederaGetTopicMessagesContent.upperThreshold,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaGetTopicMessagesParamsSchema.safeParse(paramOptions);

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

            const action = new GetTopicMessageActionService(hederaProvider);

            const response = await action.execute(paramOptions, networkType);

            if (callback && response.status === TxStatus.SUCCESS) {
                let formatedText = "";

                response.messages.forEach((hcsMessage) => {
                    formatedText += `-----------------------\nAuthor: ${hcsMessage.payer_account_id}\nBody: ${hcsMessage.message}\nTimestamp: ${convertTimestampToUTC(hcsMessage.consensus_timestamp)}\n`;
                });

                const dateRangeText = `between ${paramOptions.lowerThreshold ? paramOptions.lowerThreshold : "topic creation"} and ${paramOptions.upperThreshold ? paramOptions.upperThreshold : "this moment"}`;

                await callback({
                    text: `Messages for topic ${paramOptions.topicId} posted ${dateRangeText}:\n${formatedText}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error fetching messages. Error:", error);

            if (callback) {
                await callback({
                    text: `Error fetching messages. Error: ${error.message}`,
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
                    text: "Get messages from a topic {{0.0.123456}}.",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Show me all messages from a topic {{0.0.123456}}, that have been posted since {{05.02.2025 14:14:14:144}}.",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Show me all messages from a topic {{0.0.123456}}, that have been posted between {{05.02.2025 14:14:14:144}} and {{08.02.2025 20:14:20:144}}.",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "",
                    action: "HEDERA_GET_TOPIC_MESSAGES",
                },
            },
        ],
    ],

    similes: [
        "HEDERA_GET_TOPIC_MESSAGES",
        "HEDERA_GET_HCS_MESSAGES",
        "HCS_FETCH_MESSAGES",
    ],
};
