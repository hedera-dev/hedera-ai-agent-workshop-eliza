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
import { hederaDeleteTopicTemplate } from "../../templates";
import { HederaProvider } from "../../providers/client";
import { deleteTopicParamsSchema } from "./schema.ts";
import { DeleteTopicService } from "./services/delete-topic.ts";
import { TxStatus } from "../../shared/constants.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";

export const deleteTopicAction: Action = {
    name: "HEDERA_DELETE_TOPIC",
    description: "Delete topic with hedera consensus service.",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback
    ) => {
        try {
            const deleteTopicContext = composeContext({
                state,
                template: hederaDeleteTopicTemplate,
                templatingEngine: "handlebars",
            });

            const deleteTopicContent = await generateObjectDeprecated({
                runtime: runtime,
                context: deleteTopicContext,
                modelClass: ModelClass.SMALL,
            });

            const deleteTopicData =
                deleteTopicParamsSchema.parse(deleteTopicContent);

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new DeleteTopicService(hederaProvider);

            const response = await action.execute(deleteTopicData);

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Successfully deleted topic ${deleteTopicData.topicId}.\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error during topic deletion:", error);

            await callback({
                text: `Error during topic deletion: ${error.message}`,
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
                user: "assistant",
                content: {
                    text: "I'll help you delete topic: {{0.0.5464449}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
            {
                user: "user",
                content: {
                    text: "Delete topic with id {{0.0.5464449}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
        ],
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you delete topic: {{0.0.5464185}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
            {
                user: "user",
                content: {
                    text: "Delete topic with id {{0.0.5464185}}",
                    action: "HEDERA_DELETE_TOPIC",
                },
            },
        ],
    ],
    similes: ["DELETE_TOPIC", "REMOVE_TOPIC", "HEDERA_REMOVE_TOPIC"],
};
