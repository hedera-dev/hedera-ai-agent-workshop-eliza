import { z } from "zod";
import { TokenBalance } from "hedera-agent-kit/dist/types";
import { hederaTokenHoldersParamsSchema } from "./schema.ts";
import { TxStatus } from "../../shared/constants.ts";

export type HederaTokenHoldersParams = z.infer<
    typeof hederaTokenHoldersParamsSchema
>;

export type TokenHoldersResult = {
    status: TxStatus;
    tokenId: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimals: number;
    holdersArray: Array<TokenBalance>;
};
