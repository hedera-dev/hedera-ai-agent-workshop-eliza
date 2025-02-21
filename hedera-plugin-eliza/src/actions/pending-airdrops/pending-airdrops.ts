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
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { pendingAirdropTemplate } from "../../templates";
import { pendingAirdropsParams } from "./schema.ts";
import { GetPendingAirdropsService } from "./services/get-pending-airdrops.ts";
import { toDisplayUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";
import { get_hts_token_details } from "hedera-agent-kit/dist/tools/hts/queries";

export const pendingAirdropsAction: Action = {
    name: "HEDERA_PENDING_AIRDROPS",
    description: "Returns currently pending airdrops for accountId",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        const pendingAirdropsContext = composeContext({
            state: state,
            template: pendingAirdropTemplate,
            templatingEngine: "handlebars",
        });

        const pendingAirdropContent = await generateObjectDeprecated({
            runtime: runtime,
            context: pendingAirdropsContext,
            modelClass: ModelClass.SMALL,
        });

        console.log(
            `Extracted data: ${JSON.stringify(pendingAirdropsContext, null, 2)}`
        );

        try {
            const pendingAirdropData = pendingAirdropsParams.parse(
                pendingAirdropContent
            );

            const accountId =
                pendingAirdropData.accountId ||
                runtime.getSetting("HEDERA_ACCOUNT_ID");

            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const hederaProvider = new HederaProvider(runtime);
            const action = new GetPendingAirdropsService(hederaProvider);

            const pendingAirdrops = await action.execute(
                accountId,
                networkType
            );

            if (!pendingAirdrops.length) {
                await callback({
                    text: `There are no pending airdrops for accountId ${accountId}`,
                    content: `There are no pending airdrops for accountId ${accountId}`,
                });
                return true;
            }

            const formatedAirdrops = await Promise.all(
                pendingAirdrops.map(async (airdrop, index) => {
                    const tokenDetails = await get_hts_token_details(
                        airdrop.token_id,
                        networkType
                    );
                    const displayAmount = await toDisplayUnit(
                        airdrop.token_id,
                        airdrop.amount,
                        networkType
                    );
                    return `(${index + 1}) ${displayAmount.toString()} ${tokenDetails.symbol} (token id: ${airdrop.token_id}) from ${airdrop.sender_id}`;
                })
            ).then((results) => results.join("\n"));

            await callback({
                text: `Here are pending airdrops for account ${accountId} \n\n ${formatedAirdrops}`,
                content: {
                    availableAirdrops: pendingAirdrops,
                },
            });

            return true;
        } catch (error) {
            console.error("Error during fetching pending airdrops:", error);

            if (callback) {
                await callback({
                    text: `Error during fetching pending airdrops: ${error.message}`,
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
                    text: "Show me pending airdrops for account {{0.0.5393076}}",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me my pending airdrops",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "",
                    action: "HEDERA_PENDING_AIRDROPS",
                },
            },
        ],
    ],
    similes: ["PENDING_AIRDROPS", "GET_AIRDROPS", "GET_PENDING_AIRDROPS"],
};
