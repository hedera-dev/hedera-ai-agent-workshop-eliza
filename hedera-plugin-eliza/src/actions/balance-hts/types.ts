import { z } from "zod";
import { hederaHtsBalanceParamsSchema } from "./schema.ts";
import { TxStatus } from "../../shared/constants.ts";

export type HederaHtsBalanceParams = z.infer<
    typeof hederaHtsBalanceParamsSchema
>;

export type IHtsBalanceResponse = {
    status: TxStatus.SUCCESS;
    balance: string;
    unit: string;
    symbol: string;
};

export type TokenBalance = {
    account: string;
    balance: number;
    decimals: number;
};

type ProtobufEncodedKey = {
    _type: "ProtobufEncoded";
    key: string;
};

type CustomFees = {
    created_timestamp: string;
    fixed_fees: any[];
    fractional_fees: any[];
};

export type HtsTokenDetails = {
    admin_key: ProtobufEncodedKey;
    auto_renew_account: string;
    auto_renew_period: number;
    created_timestamp: string;
    custom_fees: CustomFees;
    decimals: string;
    deleted: boolean;
    expiry_timestamp: number;
    fee_schedule_key: ProtobufEncodedKey;
    freeze_default: boolean;
    freeze_key: ProtobufEncodedKey;
    initial_supply: string;
    kyc_key: ProtobufEncodedKey;
    max_supply: string;
    memo: string;
    metadata: string;
    metadata_key: ProtobufEncodedKey | null;
    modified_timestamp: string;
    name: string;
    pause_key: ProtobufEncodedKey;
    pause_status: "PAUSED" | "UNPAUSED";
    supply_key: ProtobufEncodedKey;
    supply_type: "FINITE" | "INFINITE";
    symbol: string;
    token_id: string;
    total_supply: string;
    treasury_account_id: string;
    type: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
    wipe_key: ProtobufEncodedKey;
};
