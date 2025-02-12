import { PrivateKey } from "@hashgraph/sdk";

export type HederaNetworkType = "mainnet" | "testnet" | "previewnet";

export type HederaKeyParams = {
    key: string;
    keyType: string;
};

export type HederaPrivateKeyResult = {
    privateKey: PrivateKey;
    type: "ECDSA" | "ED25519";
};
