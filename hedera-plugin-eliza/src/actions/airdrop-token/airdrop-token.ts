import { hederaAirdropTokenTemplate } from "../../templates";
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
import { HederaProvider } from "../../providers/client";
import { airdropTokenParamsSchema } from "./schema.ts";
import { AirdropTokenService } from "./services/airdrop-token.ts";
import { generateHashscanUrl } from "../../shared/utils.ts";
import { HederaNetworkType } from "hedera-agent-kit/src/types";
import { TxStatus } from "../../shared/constants.ts";

export const airdropTokenAction: Action = {
    name: "HEDERA_AIRDROP_TOKEN",
    description: "Airdrop a token on the Hedera network",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback
    ) => {
        try {
            const hederaAirdropTokenContext = composeContext({
                state: state,
                template: hederaAirdropTokenTemplate,
                templatingEngine: "handlebars",
            });

            const hederaAirdropTokenContent = await generateObjectDeprecated({
                runtime: runtime,
                context: hederaAirdropTokenContext,
                modelClass: ModelClass.SMALL,
            });

            console.log(
                `Extracted data: ${JSON.stringify(hederaAirdropTokenContent, null, 2)}`
            );

            const airdropTokenData = airdropTokenParamsSchema.parse(
                hederaAirdropTokenContent
            );

            const hederaProvider = new HederaProvider(runtime);
            const networkType = runtime.getSetting(
                "HEDERA_NETWORK_TYPE"
            ) as HederaNetworkType;

            const airdropTokenService = new AirdropTokenService(hederaProvider);

            const response = await airdropTokenService.execute(
                airdropTokenData,
                networkType
            );

            if (callback && response.status === TxStatus.SUCCESS) {
                const url = generateHashscanUrl(response.txHash, networkType);
                await callback({
                    text: `Airdrop token successfully executed.\nTransaction link: ${url}`,
                });
            }

            return true;
        } catch (error) {
            console.error("Error during token airdrop:", error);

            await callback({
                text: `Error during token airdrop: ${error.message}`,
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
                user: "{{user}}",
                content: {
                    text: "Airdrop {{10}} tokens {{0.0.5426001}} for {{0.0.5399001}}, {{0.0.5399012}}, {{0.0.5399023}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Airdrop {{3.75}} tokens {{0.0.5432002}} to wallets {{0.0.5401005}}, {{0.0.5402006}}, {{0.0.5403007}}, {{0.0.5404008}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Send a token airdrop of {{15}} tokens with id {{0.0.5427890}} to {{0.0.5412345}}, {{0.0.5416789}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Airdrop {{7.2}} tokens {{0.0.5436781}} to {{0.0.5401122}}, {{0.0.5402233}}, {{0.0.5403344}}, {{0.0.5404455}}, {{0.0.5405566}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Make airdrop of {{20}} tokens (token id: {{0.0.5456789}}) to multiple wallets: {{0.0.5410001}}, {{0.0.5410002}}, {{0.0.5410003}}, {{0.0.5410004}}, {{0.0.5410005}}",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
            {
                user: "{{assistant}}",
                content: {
                    text: "",
                    action: "HEDERA_AIRDROP_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "HEDERA_DROP_TOKEN",
        "HEDERA_DROP_TOKENS",
        "HEDERA_AIRDROP_TOKENS",
    ],
};
