import { CreateNFTTokenParams } from "./types.ts";

export const createNFTDetailsDescription = (params: CreateNFTTokenParams): string => {
    const name = `Name: ${params.name}`;
    const symbol = `Symbol: ${params.symbol}`;
    const maxSupply = `Max Supply: ${params.maxSupply ? params.maxSupply : `not set`}`;

    const isMetadataKey = `Metadata Key: ${params.isMetadataKey === undefined || !params.isMetadataKey ? "not set" : "Enabled"}`;
    const isAdminKey = `Admin Key: ${params.isAdminKey === undefined || !params.isAdminKey ? "not set" : "Enabled"}`;

    const tokenMetadata = `Token Metadata: ${params.tokenMetadata ? params.tokenMetadata : "not set"}`;
    const memo = `Memo: ${params.memo || "not set"}`;

    return [
        name,
        symbol,
        maxSupply,
        isMetadataKey,
        isAdminKey,
        tokenMetadata,
        memo
    ].join("\n");
};
