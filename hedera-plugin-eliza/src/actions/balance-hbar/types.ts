import { z } from "zod";
import { hederaHbarBalanceParamsSchema } from "./schema.ts";
import { TxStatus } from "../../shared/constants.ts";

export type HederaHbarBalanceParams = z.infer<
    typeof hederaHbarBalanceParamsSchema
>;

export type IHbarBalanceResponse = {
    status: TxStatus.SUCCESS;
    balance: number;
    unit: string;
};
