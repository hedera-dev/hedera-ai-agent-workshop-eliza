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
import { HederaProvider } from "../../providers/client";
import { claimAirdropTemplate } from "../../templates";
import { claimAirdropParamsSchema } from "./schema.ts";
import { ClaimAirdropService } from "./services/claim-airdrop-service.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";

export const claimAirdropAction: Action = {
    name: "HEDERA_CLAIM_AIRDROP",
    description: "Claim available pending token airdrop",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const claimAirdropContext = composeContext({
            state: state,
            template: claimAirdropTemplate,
            templatingEngine: "handlebars",
        });

        const claimAirdropContent = await generateObjectDeprecated({
            runtime: runtime,
            context: claimAirdropContext,
            modelClass: ModelClass.SMALL,
        });

        try {
            const claimAirdropData =
                claimAirdropParamsSchema.parse(claimAirdropContent);

            console.log(
                `Extracted data: ${JSON.stringify(claimAirdropData, null, 2)}`
            );

            const accountId = runtime.getSetting("HEDERA_ACCOUNT_ID");

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const action = new ClaimAirdropService(hederaProvider);

            const response = await action.execute(claimAirdropData, accountId);

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Successfully claimed airdrop for token ${claimAirdropData.tokenId}.\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error during claiming airdrop:", error);

            if (callback) {
                await callback({
                    text: `Error during claiming airdrop: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
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
                    text: "Claim airdrop (1) 5 Tokens ({{0.0.5445766}}) from {{0.0.5393076}}",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Claim airdrop (2) 50 Tokens ({{0.0.5447843}}) from {{0.0.5393076}}",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_CLAIM_AIRDROP",
                },
            },
        ],
    ],
    similes: ["CLAIM_AIRDROP", "CLAIM_TOKEN_AIRDROP", "CLAIM_TOKEN"],
};
