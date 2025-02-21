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
import { HederaTopicInfoParams } from "./types.ts";
import { TopicInfoActionService } from "./services/topic-info-action-service.ts";
import { hederaTopicInfoParamsSchema } from "./schema.ts";
import { topicInfoTemplate } from "../../templates";
import { HederaNetworkType } from "hedera-agent-kit/src/types";

export const topicInfoAction = {
    name: "HEDERA_TOPIC_INFO",
    description: "Returns details of given topic by its topic ID",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const hederaTopicInfoContext = composeContext({
            state: state,
            template: topicInfoTemplate,
            templatingEngine: "handlebars",
        });

        const hederaTopicInfoContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaTopicInfoContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaTopicInfoParams = {
            topicId: hederaTopicInfoContent.topicId,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaTopicInfoParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                const errorMessages = validationResult.error.errors.map(
                    (e) =>
                        `Field "${e.path.join(".")}" failed validation: ${e.message}`
                );
                throw new Error(
                    `Error during fetching topic info: ${errorMessages.join(", ")}`
                );
            }

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new TopicInfoActionService(hederaProvider);

            const result = await action.execute(paramOptions, networkType);

            if (callback && result !== "") {
                const url = `https://hashscan.io/${networkType}/topic/${paramOptions.topicId}`;
                await callback({
                    text: `Topic info for topic with id ${paramOptions.topicId}:\n${result}\nLink: ${url}`,
                    content: {
                        success: true,
                        topicInfo: result,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during fetching topic info: ", error);

            if (callback) {
                await callback({
                    text: `Error during fetching topic info: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: topicInfoTemplate,
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
                    text: "Give me the info for topic {{0.0.12345}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Give me the details about topic {{0.0.12345}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I'd like to see the status of topic {{0.0.67890}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Fetch topic details for {{0.0.112233}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What can you tell me about topic {{0.0.445566}}?",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Retrieve details of topic {{0.0.778899}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you provide information on topic {{0.0.556677}}?",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I'd like to get details on topic {{0.0.998877}}.",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_TOPIC_INFO",
                },
            },
        ],
    ],
    similes: [
        "HCS_TOPIC_INFO",
        "HEDERA_HCS_INFO",
        "HEDERA_TOPIC_DETAILS",
        "HCS_TOPIC_DETAILS",
    ],
};
