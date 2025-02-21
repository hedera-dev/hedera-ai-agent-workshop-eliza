import { z } from "zod";
import { hederaAllTokensBalancesParamsSchema } from "./schema.ts";
import { DetailedTokenBalance } from "hedera-agent-kit/dist/types";
import { TxStatus } from "../../shared/constants.ts";

export type HederaAllTokensBalancesParams = z.infer<
    typeof hederaAllTokensBalancesParamsSchema
>;

export type AllTokensBalancesResult = {
    status: TxStatus;
    balancesArray: Array<DetailedTokenBalance>;
};
