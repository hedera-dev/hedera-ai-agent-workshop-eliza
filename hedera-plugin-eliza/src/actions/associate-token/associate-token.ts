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
import { HederaAssociateTokenParams } from "./types.ts";
import { hederaAssociateTokenParamsSchema } from "./schema.ts";
import { AssociateTokenActionService } from "./service/associate-token-action-service.ts";
import { TxStatus } from "../../shared/constants.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { associateTokenTemplate } from "../../templates";

export const associateTokenAction = {
    name: "HEDERA_ASSOCIATE_TOKEN",
    description: "Associates provided token with given account",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        _callback?: HandlerCallback
    ) => {
        const hederaAssociateTokenContext = composeContext({
            state: state,
            template: associateTokenTemplate,
            templatingEngine: "handlebars",
        });

        const hederaAssociateTokenContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaAssociateTokenContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaAssociateTokenParams = {
            tokenId: hederaAssociateTokenContent.tokenId,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaAssociateTokenParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                throw new Error(
                    `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
                );
            }
            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new AssociateTokenActionService(hederaProvider);

            const response = await action.execute(paramOptions);

            if (_callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await _callback({
                    text: `Token ${paramOptions.tokenId} has been associated with the account.\nTransaction link: ${url}`,
                    content: {
                        success: true,
                        tokenId: paramOptions.tokenId,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error(
                `Error during associating token ${paramOptions.tokenId}:`,
                error
            );

            if (_callback) {
                await _callback({
                    text: `Error during associating token ${paramOptions.tokenId}: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: associateTokenTemplate,
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
                    text: "Associate my wallet with token {{0.0.123456}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                    tokenId: "0.0.123456",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you link my wallet to token {{0.0.654321}}?",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to associate my wallet with token {{0.0.987654}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please associate my account with token {{0.0.111222}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Connect my wallet to token {{0.0.333444}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Could you link token {{0.0.555666}} to my wallet?",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Attach token {{0.0.777888}} to my wallet.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Make my wallet associated with token {{0.0.999000}}.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I’d like to link token {{0.0.112233}} with my wallet.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Help me associate token {{0.0.445566}} to my wallet.",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_ASSOCIATE_TOKEN",
                },
            },
        ],
    ],
    similes: ["HEDERA_ASSOCIATE_HTS"],
};
