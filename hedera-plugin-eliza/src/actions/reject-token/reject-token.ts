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
import { HederaHtsBalanceParams } from "./types.ts";
import { hederaRejectTokenParamsSchema } from "./schema.ts";
import { RejectTokenActionService } from "./service/reject-token-action-service.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";
import { rejectTokenTemplate } from "../../templates";

export const rejectTokenAction = {
    name: "HEDERA_REJECT_TOKEN",
    description: "Action for rejecting HTS token airdropped to an account",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        _callback?: HandlerCallback
    ) => {
        const hederaRejectTokenContext = composeContext({
            state: state,
            template: rejectTokenTemplate,
            templatingEngine: "handlebars",
        });

        const hederaRejectTokenContent = await generateObjectDeprecated({
            runtime: runtime,
            context: hederaRejectTokenContext,
            modelClass: ModelClass.SMALL,
        });

        const paramOptions: HederaHtsBalanceParams = {
            tokenId: hederaRejectTokenContent.tokenId,
        };

        console.log(
            `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
        );

        try {
            const validationResult =
                hederaRejectTokenParamsSchema.safeParse(paramOptions);

            if (!validationResult.success) {
                throw new Error(
                    `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
                );
            }

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new RejectTokenActionService(hederaProvider);

            const response = await action.execute(paramOptions);

            if (_callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await _callback({
                    text: `Successfully rejected token: ${paramOptions.tokenId}.\nTransaction link: ${url}`,
                    content: {
                        success: true,
                        tokenId: paramOptions.tokenId,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error(
                `Error rejecting token: ${paramOptions.tokenId}.`,
                error
            );

            if (_callback) {
                await _callback({
                    text: `Error rejecting token ${paramOptions.tokenId}.\nError: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: rejectTokenTemplate,
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
                    text: "Reject token {{0.0.5424086}}.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I don't want to accept the token {{0.0.542086}} from airdrop. Reject it.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Remove airdropped token {{0.0.654321}} from my account.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I do not wish to receive token {{0.0.112233}}. Reject it immediately.",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_REJECT_TOKEN",
                },
            },
        ],
    ],
    similes: ["HEDERA_REJECT_AIRDROP", "HEDERA_REJECT_HTS", "REJECT_HTS"],
};
