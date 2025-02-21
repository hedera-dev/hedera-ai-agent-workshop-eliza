import {
    Action,
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";
import { hederaTransferTokenTemplate } from "../../templates";
import { TransferTokenService } from "./services/transfer-token.ts";
import { transferTokenParamsSchema } from "./schema.ts";
import { HederaProvider } from "../../providers/client";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";

export const transferTokenAction: Action = {
    name: "TRANSFER_TOKEN",
    description:
        "Transfer token using provided tokenId between addresses on the same chain",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback
    ) => {
        try {
            const hederaTokenTransferContext = composeContext({
                state: state,
                template: hederaTransferTokenTemplate,
                templatingEngine: "handlebars",
            });

            const hederaTokenTransferContent = await generateObjectDeprecated({
                runtime: runtime,
                context: hederaTokenTransferContext,
                modelClass: ModelClass.SMALL,
            });

            const hederaTokenTransferData = transferTokenParamsSchema.parse(
                hederaTokenTransferContent
            );

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new TransferTokenService(hederaProvider);

            const response = await action.execute(
                hederaTokenTransferData,
                networkType
            );

            if (callback && response.status === "SUCCESS") {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Transfer of token ${hederaTokenTransferData.tokenId} to ${hederaTokenTransferData.toAccountId} completed.\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error during token transfer:", error);

            await callback({
                text: `Error during token transfer: ${error.message}`,
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
                    text: "I'll help you transfer 3.10 tokens 0.0.5425085 to 0.0.4515512",
                    action: "TRANSFER_TOKEN",
                },
            },
            {
                user: "user",
                content: {
                    text: "Make transfer 3.10 of tokens 0.0.5425085 to account 0.0.4515512",
                    action: "TRANSFER_TOKEN",
                },
            },
        ],
    ],
    similes: ["SEND_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS"],
};
