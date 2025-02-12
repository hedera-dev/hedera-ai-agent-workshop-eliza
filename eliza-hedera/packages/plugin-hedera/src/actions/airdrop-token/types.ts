import { z } from "zod";
import { airdropTokenParamsSchema } from "./schema.ts";
import { AccountId } from "@hashgraph/sdk";

export type AirdropTokenParams = z.infer<typeof airdropTokenParamsSchema>;

export interface AirdropRecipient {
    accountId: string | AccountId;
    amount: number;
}
