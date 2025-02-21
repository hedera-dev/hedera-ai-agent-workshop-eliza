import type { Plugin } from "@elizaos/core";
import { hederaClientProvider } from "./providers/client";
import { balanceHbarAction } from "./actions/balance-hbar/balance-hbar.ts";
import { balanceHtsAction } from "./actions/balance-hts/balance-hts.ts";
import { balancesAllTokensAction } from "./actions/balances-all-tokens/balance-all-tokens.ts";
import { transferAction } from "./actions/transfer/transfer.ts";
import { createTokenAction } from "./actions/create-token/create-token.ts";
import { associateTokenAction } from "./actions/associate-token/associate-token.ts";
import { tokenHoldersAction } from "./actions/token-holders/token-holders.ts";
import { airdropTokenAction } from "./actions/airdrop-token/airdrop-token.ts";
import { rejectTokenAction } from "./actions/reject-token/reject-token.ts";
import { pendingAirdropsAction } from "./actions/pending-airdrops/pending-airdrops.ts";
import { claimAirdropAction } from "./actions/claim-airdrop/claim-airdrop.ts";
import { transferTokenAction } from "./actions/transfer-token/transfer-token.ts";
import { createTopicAction } from "./actions/create-topic/create-topic.ts";
import { deleteTopicAction } from "./actions/delete-topic/delete-topic.ts";
import { dissociateTokenAction } from "./actions/dissociate-token/dissociate-token.ts";
import { topicInfoAction } from "./actions/topic-info/topic-info.ts";
import { submitTopicMessageAction } from "./actions/submit-topic-message/submit-topic-message.ts";
import { getTopicMessagesAction } from "./actions/get-topic-messages/get-topic-messages.ts";
import { mintTokenAction } from "./actions/mint-token/mint-token.ts";
import { setSpendingApprovalAction } from "./actions/set-spending-approval/set-spending-approval.ts";
import { createNFTTokenAction } from "./actions/create-nft-token/create-nft-token.ts";
import { mintNFTTokenAction } from "./actions/mint-nft-token/mint-token.ts";

export const hederaPlugin: Plugin = {
    name: "Hedera",
    description: "Hedera blockchain integration plugin",
    providers: [hederaClientProvider],
    evaluators: [],
    services: [],
    actions: [
        balanceHbarAction,
        balanceHtsAction,
        balancesAllTokensAction,
        transferAction,
        createTokenAction,
        tokenHoldersAction,
        associateTokenAction,
        airdropTokenAction,
        rejectTokenAction,
        pendingAirdropsAction,
        claimAirdropAction,
        transferTokenAction,
        createTopicAction,
        deleteTopicAction,
        dissociateTokenAction,
        topicInfoAction,
        submitTopicMessageAction,
        getTopicMessagesAction,
        mintTokenAction,
        createNFTTokenAction,
        mintNFTTokenAction,
        setSpendingApprovalAction,
        createNFTTokenAction
    ],
};

export default hederaPlugin;
