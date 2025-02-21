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
import { SubmitTopicMessageActionService } from "./services/submit-topic-message-action-service.ts";
import { HederaSubmitTopicMessageParams } from "./types.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { SubmitMessageResult } from "hedera-agent-kit/src/types";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { hederaSubmitTopicMessageParamsSchema } from "./schema.ts";
import { submitTopicMessageTemplate } from "../../templates";

export const submitTopicMessageAction = {
    name: "HEDERA_SUBMIT_TOPIC_MESSAGE",
    description: "Submits message to a topic given by its id",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const hederaSubmitTopicMessageContext = composeContext({
            state: state,
            template: submitTopicMessageTemplate,
            templatingEngine: "handlebars",
        });

        const hederaSubmitTopicMessageContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaSubmitTopicMessageContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaSubmitTopicMessageParams = {
            topicId: hederaSubmitTopicMessageContent.topicId,
            message: hederaSubmitTopicMessageContent.message,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaSubmitTopicMessageParamsSchema.safeParse(paramOptions);

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

            const action = new SubmitTopicMessageActionService(hederaProvider);

            const response: SubmitMessageResult =
                await action.execute(paramOptions);

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Successfully submitted message to topic: ${paramOptions.topicId}\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error(
                "Error during submitting message. You might not have the submitting privileges for this topic. Error:",
                error
            );

            if (callback) {
                await callback({
                    text: `Error during submitting message. You might not have the submitting privileges for this topic. Error: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: submitTopicMessageTemplate,
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
                    text: "Submit message: 'hello world' to topic 0.0.123456.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'hello world' to topic 0.0.123456.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Submit message 'Hedera is great!' to topic 0.0.654321.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'Hedera is great!' to topic 0.0.654321.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "I want to post to topic 0.0.987654. Message: Smart contracts update.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'Smart contracts update' to topic 0.0.987654.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Send 'DeFi price feed update' to topic 0.0.456789.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'DeFi price feed update' to topic 0.0.456789.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Post 'Security alert: suspicious activity' to topic 0.0.112233.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll submit 'Security alert: suspicious activity' to topic 0.0.112233.",
                    action: "HEDERA_SUBMIT_TOPIC_MESSAGE",
                },
            },
        ],
    ],

    similes: ["HEDERA_NEW_MESSAGE", "HCS_MESSAGE", "HCS_TOPIC_SUBMIT_MESSAGE"],
};
