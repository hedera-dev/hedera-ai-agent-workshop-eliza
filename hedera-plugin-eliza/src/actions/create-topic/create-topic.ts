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
import { hederaCreateTopicTemplate } from "../../templates";
import { createTopicParamsSchema } from "./schema.ts";
import { HederaProvider } from "../../providers/client";
import { CreateTopicService } from "./services/create-topic.ts";
import { TxStatus } from "../../shared/constants.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";

export const createTopicAction: Action = {
    name: "HEDERA_CREATE_TOPIC",
    description: "Create topic with hedera consensus service for messaging.",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback
    ) => {
        try {
            const createTopicContext = composeContext({
                state,
                template: hederaCreateTopicTemplate,
                templatingEngine: "handlebars",
            });

            const createTopicContent = await generateObjectDeprecated({
                runtime: runtime,
                context: createTopicContext,
                modelClass: ModelClass.SMALL,
            });

            console.log(
                `Extracted data: ${JSON.stringify(createTopicContent, null, 2)}`
            );

            const createTopicData =
                createTopicParamsSchema.parse(createTopicContent);

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new CreateTopicService(hederaProvider);

            const response = await action.execute(createTopicData);

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Successfully created topic: ${response.topicId}.\nTransaction link: ${url}\n`,
                    content: {
                        success: true,
                        topicId: response.topicId,
                    },
                });
            }

            return true;
        } catch (error) {
            console.error("Error during topic creation:", error);

            await callback({
                text: `Error during topic creation: ${error.message}`,
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
                user: "user",
                content: {
                    text: "Create a new topic with memo 'blockchain logs'",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: blockchain logs",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create for me a new topic with memo 'NFT transactions'",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: NFT transactions",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create a new topic with memo 'DeFi logs'. Use a submit key.",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: DeFi logs and submit key enabled",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create a new topic with memo 'security alerts'. Restrict posting with a key.",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: security alerts and submit key enabled",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Create a topic with memo 'open discussion'. Let everyone post.",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll help you create new with memo: open discussion",
                    action: "HEDERA_CREATE_TOPIC",
                },
            },
        ],
    ],
    similes: ["CREATE_TOPIC", "NEW_TOPIC", "HEDERA_NEW_TOPIC"],
};
