import { CreateTokenParams } from "./types.ts";

export const createFTDetailsDescription = (params: CreateTokenParams): string => {
    const name = `Name: ${params.name}`;
    const symbol = `Symbol: ${params.symbol}`;

    const decimals = `Decimals: ${params.decimals}`;
    const initialSupply = `Initial supply: ${params.initialSupply}`;

    const isSupplyKey = `Supply Key: ${params.isMetadataKey === undefined || !params.isSupplyKey ? "not set" : "Enabled"}`;
    const isMetadataKey = `Metadata Key: ${params.isMetadataKey === undefined || !params.isMetadataKey ? "not set" : "Enabled"}`;
    const isAdminKey = `Admin Key: ${params.isAdminKey === undefined || !params.isAdminKey ? "not set" : "Enabled"}`;

    const tokenMetadata = `Token Metadata: ${params.tokenMetadata ? params.tokenMetadata : "not set"}`;
    const memo = `Memo: ${params.memo || "not set"}`;

    return [
        name,
        symbol,
        decimals,
        initialSupply,
        isSupplyKey,
        isMetadataKey,
        isAdminKey,
        tokenMetadata,
        memo
    ].join("\n");
};
