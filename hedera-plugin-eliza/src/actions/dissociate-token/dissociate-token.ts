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
import { DissociateTokenActionService } from "./service/dissociate-token-action-service.ts";
import { TxStatus } from "../../shared/constants.ts";
import { hederaDissociateTokenParamsSchema } from "./schema.ts";
import { HederaDissociateTokenParams } from "./types.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { dissociateTokenTemplate } from "../../templates";

export const dissociateTokenAction = {
    name: "HEDERA_DISSOCIATE_TOKEN",
    description: "Dissociates provided token with given account",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        _callback?: HandlerCallback
    ) => {
        const hederaDissociateTokenContext = composeContext({
            state: state,
            template: dissociateTokenTemplate,
            templatingEngine: "handlebars",
        });

        const hederaDissociateTokenContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaDissociateTokenContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaDissociateTokenParams = {
            tokenId: hederaDissociateTokenContent.tokenId,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaDissociateTokenParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                throw new Error(
                    `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
                );
            }

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new DissociateTokenActionService(hederaProvider);

            const response = await action.execute(paramOptions);

            if (_callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await _callback({
                    text: `Token ${paramOptions.tokenId} has been dissociated from account.\nTransaction link: ${url}`,
                    content: {
                        success: true,
                        tokenId: paramOptions.tokenId,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error(
                `Error during dissociating token ${paramOptions.tokenId}:`,
                error
            );

            if (_callback) {
                await _callback({
                    text: `Error during dissociating token ${paramOptions.tokenId}: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: dissociateTokenTemplate,
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
                    text: "Disassociate my wallet from token {{0.0.123456}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                    tokenId: "0.0.123456",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you unlink my wallet from token {{0.0.654321}}?",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to remove my wallet’s association with token {{0.0.987654}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please remove my account’s link to token {{0.0.111222}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Disconnect my wallet from token {{0.0.333444}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Could you remove token {{0.0.555666}} from my wallet?",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Detach token {{0.0.777888}} from my wallet.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Make my wallet no longer associated with token {{0.0.999000}}.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I’d like to unlink token {{0.0.112233}} from my wallet.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Help me disassociate token {{0.0.445566}} from my wallet.",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_DISSOCIATE_TOKEN",
                },
            },
        ],
    ],
    similes: ["HEDERA_DISSOCIATE_HTS", "HEDERA_UNLINK_TOKEN"],
};
