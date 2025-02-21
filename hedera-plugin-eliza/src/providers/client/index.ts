import { IAgentRuntime, Memory, State } from "@elizaos/core";
import { PrivateKey } from "@hashgraph/sdk";
import { HederaKeyParams, HederaPrivateKeyResult } from "../../shared/types.ts";
import { HederaAgentKit } from "hedera-agent-kit";

export class HederaProvider {
    private readonly agentKit: HederaAgentKit;

    constructor(_runtime: IAgentRuntime) {
        this.agentKit = initAgentKit(_runtime);
    }

    getHederaAgentKit(): HederaAgentKit {
        return this.agentKit;
    }
}

export const initAgentKit = (_runtime: IAgentRuntime): HederaAgentKit => {
    const accountID = _runtime.getSetting("HEDERA_ACCOUNT_ID");
    const privateKeyString = _runtime.getSetting("HEDERA_PRIVATE_KEY");
    const privateKeyType = _runtime.getSetting("HEDERA_KEY_TYPE");
    const networkType = _runtime.getSetting("HEDERA_NETWORK_TYPE") as
        | "mainnet"
        | "testnet"
        | "previewnet";
    const hederaPrivateKey = hederaPrivateKeyFromString({
        key: privateKeyString,
        keyType: privateKeyType,
    });

    let hederaAgentKit: HederaAgentKit;
    try {
        hederaAgentKit = new HederaAgentKit(
            accountID,
            hederaPrivateKey.privateKey.toStringDer(),
            networkType
        );
    } catch (error) {
        console.error("Error initialising HederaAgentKit: ", error);
    }
    return hederaAgentKit;
};

const hederaPrivateKeyFromString = ({
    key,
    keyType,
}: HederaKeyParams): HederaPrivateKeyResult => {
    let privateKey: PrivateKey;

    try {
        if (keyType === "ECDSA") {
            privateKey = PrivateKey.fromStringECDSA(key); // works with both 'HEX Encoded Private Key' and 'DER Encoded Private Key' for ECDSA
        } else if (keyType === "ED25519") {
            privateKey = PrivateKey.fromStringED25519(key); // works with both 'HEX Encoded Private Key' and 'DER Encoded Private Key' for ED25519
        } else {
            throw new Error(
                "Unsupported key type. Must be 'ECDSA' or 'ED25519'."
            );
        }
    } catch (error) {
        throw new Error(`Invalid private key or key type: ${error.message}`);
    }

    return { privateKey, type: keyType };
};

export const hederaClientProvider = {
    async get(
        runtime: IAgentRuntime,
        _message: Memory,
        state?: State
    ): Promise<string | null> {
        try {
            const hederaProvider = new HederaProvider(runtime);
            const hederaAgentKit = hederaProvider.getHederaAgentKit();
            const balance = await hederaAgentKit.getHbarBalance();
            const agentName = state?.agentName || "The agent";
            const address = runtime.getSetting("HEDERA_ACCOUNT_ID");

            return `${agentName}'s Hedera Wallet Address: ${address}\nBalance: ${balance} HBAR\n`;
        } catch (error) {
            console.error("Error in Hedera client provider:", error);
            return null;
        }
    },
};
