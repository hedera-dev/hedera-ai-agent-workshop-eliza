// src/providers/client/index.ts
import { PrivateKey } from "@hashgraph/sdk";
import { HederaAgentKit } from "hedera-agent-kit";
var HederaProvider = class {
  agentKit;
  constructor(_runtime) {
    this.agentKit = initAgentKit(_runtime);
  }
  getHederaAgentKit() {
    return this.agentKit;
  }
};
var initAgentKit = (_runtime) => {
  const accountID = _runtime.getSetting("HEDERA_ACCOUNT_ID");
  const privateKeyString = _runtime.getSetting("HEDERA_PRIVATE_KEY");
  const privateKeyType = _runtime.getSetting("HEDERA_KEY_TYPE");
  const networkType = _runtime.getSetting("HEDERA_NETWORK_TYPE");
  const hederaPrivateKey = hederaPrivateKeyFromString({
    key: privateKeyString,
    keyType: privateKeyType
  });
  let hederaAgentKit;
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
var hederaPrivateKeyFromString = ({
  key,
  keyType
}) => {
  let privateKey;
  try {
    if (keyType === "ECDSA") {
      privateKey = PrivateKey.fromStringECDSA(key);
    } else if (keyType === "ED25519") {
      privateKey = PrivateKey.fromStringED25519(key);
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
var hederaClientProvider = {
  async get(runtime, _message, state) {
    try {
      const hederaProvider = new HederaProvider(runtime);
      const hederaAgentKit = hederaProvider.getHederaAgentKit();
      const balance = await hederaAgentKit.getHbarBalance();
      const agentName = state?.agentName || "The agent";
      const address = runtime.getSetting("HEDERA_ACCOUNT_ID");
      return `${agentName}'s Hedera Wallet Address: ${address}
Balance: ${balance} HBAR
`;
    } catch (error) {
      console.error("Error in Hedera client provider:", error);
      return null;
    }
  }
};

// src/actions/balance-hbar/balance-hbar.ts
import {
  composeContext,
  generateObjectDeprecated,
  ModelClass
} from "@elizaos/core";

// src/actions/balance-hbar/schema.ts
import { z } from "zod";
var hederaHbarBalanceParamsSchema = z.object({
  symbol: z.string(),
  address: z.string()
});

// src/actions/balance-hbar/services/hbar-balance-action-service.ts
var HbarBalanceActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    if (!params.address) {
      throw new Error("No receiver address");
    }
    if (!params.symbol) {
      throw new Error("No symbol");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const balance = await agentKit.getHbarBalance(params.address);
    return {
      status: "SUCCESS" /* SUCCESS */,
      balance,
      unit: "HBAR"
    };
  }
};

// src/templates/index.ts
var hederaHBARTransferTemplate = `Given the recent messages and hedera wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about the requested HBAR transfer:
1. **Amount**:
   - Extract only the numeric value from the instruction.
   - The value must be a string representing the amount in the display denomination (e.g., "0.0001" for HBAR). Do not include the symbol.

2. **Recipient AccountId**:
   - Must be a valid hedera account id in template "0.0.NUMBER".
   - Return value always as string, Examples: "0.0.123", "0.0.2314"

Always try to extract the information from last message! Do not use previously completed requests data to fill extracted information!
Respond with a JSON markdown block containing only the extracted values. All fields except 'token' are required:
\`\`\`json
{
    "amount": string,
    "accountId": string
}
\`\`\`

Example response for the input: "Make transfer 0.10HBAR to 0.0.4515512", the response should be:
\`\`\`json
{
    "amount": "0.10",
    "accountId": "0.0.4515512"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var hederaCreateTokenTemplate = `Given the recent messages and hedera wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about the token to create on hedera blockchain:
1. **Token name**:
   - Extract name of the token.
   - The value must be a string representing the name of the new token.

2. **Token Symbol**:
   - The token symbol is specified as a string.
   - The string should contains only capitalized letters.

3. **Decimals**:
   - Extract only the numeric value from the instruction.
   - The number of decimal places a token is divisible by.

4. **Initial Supply**:
   - Extract only the numeric value from the instruction.
   - Specifies the initial supply of fungible tokens to be put in circulation.

5. **Is Supply Key**:
   - boolean - true or false
   - defines if account creating the token can mint additional tokens
   - extract information about the supplyKey from user prompt.
   - If information is present, set it to true.
   - If there is no information about supplyKey or it's explicitly said to set it to false in parsed request set it to false!
   
4. **Is Metadata Key**:
   - Boolean - true or false.
   - Defines if the metadata key is set for the token.
   - Extract whether metadata key should be enabled (true) or disabled (false).
   - If there is no information about metadata key or it's explicitly said to not set it, set it to false.

5. **Is Admin Key**:
   - Boolean - true or false.
   - Defines if the admin key is set for the token.
   - Extract whether the admin key should be enabled (true) or disabled (false).
   - If there is no information about admin key or it's explicitly said to not set it, set it to false.

6. **Token Metadata**:
   - Must be a string
   - Optional metadata for the NFT token (string).
   - If included, extract the value.
   - If not provided, leave it empty.

7. **Memo**:
   - Must be a string
   - Optional field for adding a memo or description for the token creation.
   - If present, extract the memo content.


Always try to extract the information from last message! Do not use previously completed requests data to fill extracted information!
Respond with a JSON markdown block containing only the extracted values. Only name, symbol, decimals and initialSupply are required!
Keep in mind that passing token metadata string does not set the isMetadataKey to true. User might want to add the string but don't set the key.
\`\`\`json
{
    "name": string,
    "symbol": string,
    "decimals": number,
    "initialSupply": number,
    "isSupplyKey": boolean | null,
    "isMetadataKey": boolean | null,
    "isAdminKey": boolean | null,
    "tokenMetadata": string | null,
    "memo": string | null,
}
\`\`\`

Example response for the input: "Create new token with name MyToken with symbol MTK, 8 decimals and 1000 initial supply. Set the memo as 'This is a memo' and the metadata as 'And this is metadata for FT token'.", the response should be:
\`\`\`json
{
    "name": "MyToken",
    "symbol": "MTK",
    "decimals": 8,
    "initialSupply": 1000,
    "isSupplyKey": false,
    "isMetadataKey": false,
    "isAdminKey": false,
    "tokenMetadata": "And this is metadata for FT token",
    "memo": "This is a memo",
}
\`\`\`

Example response for the input: "Create new token with name NextToken with symbol NXT, 5 decimals and 1000 initial supply. I want to set the supply key so I could more tokens later. Also set the metadata and admin key.", the response should be:
\`\`\`json
{
    "name": "NextToken",
    "symbol": "NXT",
    "decimals": 5,
    "initialSupply": 1000,
    "isSupplyKey": true,
    "isMetadataKey": true,
    "isAdminKey": true,
    "tokenMetadata": null,
    "memo": null,
}
\`\`\`

Example response for the input: "Create new token with name NextToken with symbol NXT, 5 decimals and 1000 initial supply. This is final supply of this token, don't set the supply key.", the response should be:
\`\`\`json
{
    "name": "NextToken",
    "symbol": "NXT",
    "decimals": 5,
    "initialSupply": 1000,
    "isSupplyKey": false,
    "isMetadataKey": false,
    "isAdminKey": false,
    "tokenMetadata": null,
    "memo": null,
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var hederaCreateNFTTokenTemplate = `Given the hedera wallet information below:
{{walletInfo}}
And last message from user in: {{recentMessages}}

Extract the following information about the NFT token to create on hedera blockchain:
1. **Token name**:
   - Extract the name of the NFT token.
   - The value must be a string representing the name of the new NFT token.

2. **Token Symbol**:
   - The token symbol is specified as a string.
   - The string should contain only capitalized letters.

3. **Max Supply**:
   - Extract only the numeric value from the instruction.
   - The number of tokens that can be created, if specified. This is an optional field.
   - If not provided return null

4. **Is Metadata Key**:
   - Boolean - true or false.
   - Defines if the metadata key is set for the token.
   - Extract whether metadata key should be enabled (true) or disabled (false).
   - If there is no information about metadata key or it's explicitly said to not set it, set it to false.

5. **Is Admin Key**:
   - Boolean - true or false.
   - Defines if the admin key is set for the token.
   - Extract whether the admin key should be enabled (true) or disabled (false).
   - If there is no information about admin key or it's explicitly said to not set it, set it to false.

6. **Token Metadata**:
   - Must be a string
   - Optional metadata for the NFT token (string).
   - If included, extract the value.
   - If not provided, leave it empty.

7. **Memo**:
   - Must be a string
   - Optional field for adding a memo or description for the token creation.
   - If present, extract the memo content.

Always try to extract the information from the last message! Do not use previously completed requests data to fill extracted information!
Respond with a JSON markdown block containing only the extracted values. Only name and symbol are required!
\`\`\`json
{
    "name": string,
    "symbol": string,
    "maxSupply": number | null,
    "isMetadataKey": boolean | null,
    "isAdminKey": boolean | null,
    "tokenMetadata": string | null,
    "memo": string | null,
}
\`\`\`

Example response for the input: "Create new NFT token with name MyNFT with symbol NFT, maximum supply of 100, and metadata: 'Metadata content'.", the response should be:
\`\`\`json
{
    "name": "MyNFT",
    "symbol": "NFT",
    "maxSupply": 100,
    "isMetadataKey": false,
    "isAdminKey": false,
    "tokenMetadata": "Metadata content",
    "memo": null
}
\`\`\`

Example response for the input: "Create NFT token called ArtToken with symbol ART, maximum supply of 50, and no metadata key. Add memo 'Limited Edition' for the token.", the response should be:
\`\`\`json
{
    "name": "ArtToken",
    "symbol": "ART",
    "maxSupply": 50,
    "isMetadataKey": false,
    "isAdminKey": false,
    "tokenMetadata": null,
    "memo": "Limited Edition"
}
\`\`\`

Example response for the input: "Launch NFT token called UniqueNFT with symbol UNQ, maximum supply 10. No metadata key, admin key should be set, and no memo.", the response should be:
\`\`\`json
{
    "name": "UniqueNFT",
    "symbol": "UNQ",
    "maxSupply": 10,
    "isMetadataKey": false,
    "isAdminKey": true,
    "tokenMetadata": null,
    "memo": null
}
\`\`\`

Example response for the input: "Launch NFT token called MoonNFT with symbol MOON, maximum supply 1234. Set metadata key and admin key. Create memo 'To the moon!' and metadata 'This is moon NFT token'.", the response should be:
\`\`\`json
{
    "name": "MoonNFT",
    "symbol": "MOON",
    "maxSupply": 1234,
    "isMetadataKey": true,
    "isAdminKey": true,
    "tokenMetadata": "This is moon NFT token",
    "memo": "To the moon!"
}
\`\`\`

### Expected return types:

- **String** for \`name\`, \`symbol\`, \`tokenMetadata\`, and \`memo\`.
- **Number** for \`maxSupply\`.
- **Boolean** (\`true\` or \`false\`) for \`isMetadataKey\` and \`isAdminKey\`.
- **Null** where no value is provided or if it\u2019s explicitly stated.

Now respond with a JSON markdown block containing only the extracted values.
`;
var hederaAirdropTokenTemplate = `Given the recent messages and hedera wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about the token airdrop in hedera using newest message from {{recentMessages}}:
1. **Token id**:
   - Extract id of the token to airdrop.
   - The value must be a string representing id of token.

2. **Recipients**:
   - Extract recipients as array of strings.
   - Each element of array must be a string which represent accountId of recipient.

3. **Amount**:
   - Extract value of token to send to recipients.
   - The value must be number, represent amount of tokens to send.

Always try to extract the information from last message! Do not use previously completed requests data to fill extracted information!
Airdrop can support up to 10 addresses. If only one is provided also return it as a list!

Respond with a JSON markdown block containing only the extracted values.
All fields are required, recipients array should have minimum one accountId(string):
\`\`\`json
{
    "tokenId": string,
    "recipients": string[],
    "amount": number
}
\`\`\`

Example response for the input: "Airdrop 50 tokens 0.0.5425085 for 0.0.5398121, 0.0.5393967, 0.0.5395127", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5425085",
    "recipients": ["0.0.5398121", "0.0.5393967", "0.0.5395127"],
    "amount": 50
}
\`\`\`

Example response for the input: "Airdrop 50 tokens 0.0.5425085 for 0.0.5398121.", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5425085",
    "recipients": ["0.0.5398121"],
    "amount": 50
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var pendingAirdropTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
If in message there is no accountId or anything that looks similar to accountId for example: "0.0.5422268", return this json.
\`\`\`json
{
    "accountId": null
}
\`\`\`
If message include accountId for example "0.0.5422268" extract this data with following instructions.
1. **Account Id**
    - Account Id should look like "0.0.5422268" and should be a string.
    - Account Id as string can't have other chars than numbers 0 to 9 and dots.
    - Dots can neither start nor end accountId, there is always a number on the start and on the end.
    - If you cant find accountId return structure with account id equal null.
    - Example account ids are "0.0.5422268", "0.0.4515756"

Respond with a JSON markdown block containing only the extracted values. accountId:
\`\`\`json
{
    "accountId": string | null   // The accountId for example "0.0.4515756" or if doesnt exist null
}
\`\`\`

Example response for the input: "Show me my pending airdrops", the response should be:
\`\`\`json
{
    "accountId": null
}
\`\`\`

Example response for the input: "Show me my airdrops", the response should be:
\`\`\`json
{
    "accountId": null
}
\`\`\`

Example response for the input: "Show pending airdrops for 0.0.4515756", the response should be:
\`\`\`json
{
    "accountId": "0.0.4515756"
}
\`\`\`

Example response for the input: "Show me airdrops for 0.0.5422268", the response should be:
\`\`\`json
{
    "accountId": "0.0.5422268"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var claimAirdropTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract data of pending token airdrop from message with following instructions.
1. **Sender Id**
    - Sender Id should look like "0.0.5422268" and should be a string.
    - Sender Id as string cant have other chars than numbers 0 to 9 and dots.
    - Dots can't start senderId string or end, there is always a number on the start and end.
    - Example sender ids are "0.0.5422268", "0.0.4515756"

2. **Token Id**
    - Token Id should looks like "0.0.5422268" and should be string.
    - Token Id as string cant have other chars than numbers 0 to 9 and dots.
    - Dots can't start tokenId string or end, there is always a number on the start and end.
    - Example token ids are "0.0.5447843", "0.0.4515756"

Respond with a JSON markdown block containing only the extracted values:
\`\`\`json
{
    "senderId": string,   // The senderId for example "0.0.4515756"
    "tokenId": string   // The tokenId for example "0.0.4515756"
}
\`\`\`

The message commonly have structure like "Claim airdrop (1) 5 Tokens (TOKEN_ID) from SENDER_ID" where TOKEN_ID and SENDER_ID are variables to extract.

Example response for the input: "Claim airdrop (1) 5 Tokens (0.0.5445766) from 0.0.5393076", the response should be:
\`\`\`json
{
    "senderId": "0.0.5393076",
    "tokenId": "0.0.5445766"
}
\`\`\`

Example response for the input: "Claim airdrop (2) 50 Tokens (0.0.5447843) from 0.0.5393076", the response should be:
\`\`\`json
{
    "senderId": "0.0.5393076",
    "tokenId": "0.0.5447843"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var hederaTransferTokenTemplate = `Given the recent messages and hedera wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about the token transaction:
1. **tokenId**:
   - Extract id of the token.
   - The value must be a string representing id of token on hedera chain.
   - Example tokenId: "0.0.5425085"

2. **toAccountId**:
   - Extract recipient account Id specified as a string.
   - The string should contains only numbers and dots.
   - Example accountId: "0.0.4515512"

3. **amount**:
   - Extract only the numeric value from the instruction.
   - The amount of tokens to send as decimal number.

Respond with a JSON markdown block containing only the extracted values. All fields except 'token' are required:
\`\`\`json
{
    "tokenId": string, // Id of token to send as a string.
    "toAccountId": string, // Recipient account Id specified as a string.
    "amount": number // Amount of tokens to send as number.
\`\`\`

Example response for the input: "Make transfer 3.10 of tokens 0.0.5425085 to account 0.0.4515512", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5425085",
    "toAccountId": "0.0.4515512",
    "amount": 3.10
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var hederaCreateTopicTemplate = `Given the recent messages and hedera wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about the new topic:
1. **Topic memo**:
   - Extract string representing memo of topic.
   - The value must be a string, may be single or multiple words.
   - Example topic memo: "crypto", "token transfer logs"
2. **Is Submit Key**:
    - boolean - true or false
    - defines if posting to topic is protected by submitKey
    - extract information about the submitKey from user prompt.
    - If information is present, set it to true.
    - If there is no information about submitKey or it's explicitly said to set it to false in parsed request set it to false!

Check if you have correctly interpreted the isSubmitKey as true or false.

Respond with a JSON markdown block containing only the extracted values. All fields are required, always set isSubmitKey:
\`\`\`json
{
    "memo": string,
    "isSubmitKey": boolean
}
\`\`\`

Example response for the input: "Create new topic with crypto memo", the response should be:
\`\`\`json
{
    "memo": "crypto",
    "isSubmitKey": false
}
\`\`\`

Example response for the input: "Create new topic with memo 'token transfer logs'. Use submit key.", the response should be:
\`\`\`json
{
    "memo": "token transfer logs",
    "isSubmitKey": true
}
\`\`\`

Example response for the input: "Create new topic with memo "token transfer logs". Guard posting to topic with key.", the response should be:
\`\`\`json
{
    "memo": "token transfer logs",
    "isSubmitKey": true
}
\`\`\`

Example response for the input: "Create new topic with memo: "token transfer logs". Let everyone post to it.", the response should be:
\`\`\`json
{
    "memo": "token transfer logs",
    "isSubmitKey": false
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var hederaDeleteTopicTemplate = `Given the recent messages and hedera wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about the topic to delete:
1. **Topic Id**
    - Topic Id should look like "0.0.5422268" and should be a string.
    - Topic Id as string cant have other chars than numbers 0 to 9 and dots.
    - Dots can't start Topic Id string or end, there is always a number on the start and end.
    - Example topic ids are "0.0.5422268", "0.0.4515756"

Respond with a JSON markdown block containing only the extracted values. All fields are required:
\`\`\`json
{
    "topicId": string // String representing topicId
}
\`\`\`

Example response for the input: "Delete topic 0.0.5464449", the response should be:
\`\`\`json
{
    "topicId": "0.0.5464449"
}
\`\`\`

Example response for the input: "Delete topic 0.0.5464185", the response should be:
\`\`\`json
{
    "memo": "0.0.5464185"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var balanceHbarTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about HBAR balance:
1. **Wallet Address**:
   - must be a string. Do not include dot after last character. Example of correct address: "0.0.539314"

2. **Symbol**:
   - Must be HBAR

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields except 'token' are required:
\`\`\`json
{
    "symbol": string,
    "address": string
\`\`\`

Example response for the input: "Show me HBAR balance of wallet 0.1.123123.", the response should be:
\`\`\`json
{
    "symbol": "HBAR",
    "address": "0.1.123123"
}
\`\`\`

Example response for the input: "Show me HBAR balance of wallet 0.0.539314.", the response should be:
\`\`\`json
{
    "symbol": "HBAR",
    "address": "0.0.539314"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var balanceHtsTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}

Extract the data about last request. Do not use earlier provided wallet addresses nor token Ids.

Extract the following information about HTS balance request:
1. **Wallet Address**:
   - must be a string. Do not include dot after last character. Example of correct address: "0.0.539314".

2. **TokenId**:
   - Must be a string Do not include dot after last character. Example of correct tokenId: "0.0.5422268".

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields except 'token' are required:
\`\`\`json
{
    "tokenId": string,
    "address": string
}
\`\`\`

Example response for the input: "Show me balance of token 0.0.5424086 for wallet 0.0.5423981.", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5424086",
    "address": "0.0.5423981"
}
\`\`\`
Note that the last dot '... for wallet 0.0.5423981.' was omitted while extracting wallet address.

Example response for the input: "Show me balance of HTS-TOKEN with id 0.0.5422268 for wallet 0.0.5423949.", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5422268",
    "address": "0.0.5423949"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var balancesAllTokensTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about all tokens balances request:
1. **Wallet Address**:
   - must be a string. Do not include dot after last character. **OPTIONAL PARAMETER!!!**

Always try to first extract the wallet address from user prompt.
Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields except 'token' are required:
\`\`\`json
{
    "address": string
}
\`\`\`

Example response for the input: "Show me tokens balances for wallet 0.1.123123.", the response should be:
\`\`\`json
{
    "address": "0.1.123123"
}
\`\`\`

Example response for the input: "Show me your token balances", the response should be:
\`\`\`json
{
    "address": null
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var rejectTokenTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about rejecting token request:
1. **Token id**:
   - must be a string. Do not include dot after last character. Example of correct token id: "0.0.539314".

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields are required:
\`\`\`json
{
    "tokenId": string
}
\`\`\`

Example response for the input: "Reject token 0.0.5445349.", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5445349"
}
\`\`\`

Example response for the input: "Reject received airdrop of token 0.0.539314.", the response should be:
\`\`\`json
{
    "tokenId": "0.0.539314"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var associateTokenTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about associating tokens with account:
1. **Token id**
    - Must be a string Do not include dot after last character. Example of correct tokenId: "0.0.5422268".

Respond with a JSON markdown block containing only the extracted values. All fields are required:
\`\`\`json
{
    "tokenId": string,
}
\`\`\`

Example response for the input: "Associate your wallet with token 0.0.5422268", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5422268"
}
\`\`\`

Example response for the input: "Associate wallet with token 0.0.5422333", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5422333"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var dissociateTokenTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about dissociating tokens with account:
1. **Token id**
    - Must be a string. Do not include dot after last character. Example of correct tokenId: "0.0.5422268".

Respond with a JSON markdown block containing only the extracted values. All fields are required:
\`\`\`json
{
    "tokenId": string,
}
\`\`\`

Example response for the input: "Dissociate your wallet with token 0.0.5422268", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5422268"
}
\`\`\`

Example response for the input: "Dissociate wallet with token 0.0.5422333", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5422333"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var tokenHoldersTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}
Extract the following information about all tokens balances request:
1. **Token Id**:
   - must be a string. Do not include dot after last character. Example of correct token id: "0.0.539314".
2. **Threshold**:
   - must be a number. It's **OPTIONAL**. Example: 1000

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. Fields:
\`\`\`json
{
    "tokenId": string,
    "threshold": number
}
\`\`\`

Example response for the input: "Can you show me the token holders for 0.0.3391484", the response should be:
\`\`\`json
{
    "tokenId": "0.0.3391484",
}
\`\`\`

Example response for the input: "Who owns token 0.0.5432123 and what are their balances? Include only wallets with more than 1234 tokens." the response should be:
\`\`\`json
{
    "tokenId": "0.0.5432123",
    "threshold": 1234
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var topicInfoTemplate = `Given the recent messages
{{recentMessages}}
Extract the following information requested topic id:
1. **Topic Id**:
   - must be a string. Do not include dot after last character. Example of correct topic id: "0.0.5469474".

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted value. Structure:
\`\`\`json
{
    "topicId": string
}
\`\`\`

Example response for the input: "Can you show me info about topic 0.0.5469474", the response should be:
\`\`\`json
{
    "topicId": "0.0.5469474"
}
\`\`\`

Example response for the input: "Show me details for topic 0.0.5469475" the response should be:
\`\`\`json
{
    "topicId": "0.0.5469475"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var submitTopicMessageTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}

Extract the following information about message to submit to topic request:
1. **Topic Id**:
   - must be a string. Do not include dot after last character. Example of correct topicId: "0.0.539314".

2. **Message Body**:
   - Must be a string.

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields are required:
\`\`\`json
{
    "topicId": string,
    "message": string
}
\`\`\`

Example response for the input: "Submit message: 'test message' to topic 0.0.5423981.", the response should be:
\`\`\`json
{
    "topicId": "0.0.5423981",
    "message": "test message"
}
\`\`\`

Example response for the input: "Submit message 'test message2' topic 0.0.5423966.", the response should be:
\`\`\`json
{
    "topicId": "0.0.5423966",
    "message": "test message2"
}
\`\`\`

Example response for the input: "I want post to topic 0.0.5423966. Message: test message3.", the response should be:
\`\`\`json
{
    "topicId": "0.0.5423966",
    "message": "test message3"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var getTopicMessagesTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}

Using only last message extract the following information about message to submit to topic request:
1. **Topic Id**:
   - must be a string. Do not include dot after last character. Example of correct topicId: "0.0.539314".
2. **Lower Threshold**:
   - Must be a string.
   - A valid string date format that can be parsed into an unix timestamp.
   - null if not provided
3. **Upper Threshold**:
   - Must be a string.
   - A valid string date format that can be parsed into an unix timestamp.
   - null if not provided

Must not use information from user messages other than the last one!
Extract information from user prompt and create from them strings in format ex. "2025-02-05T14:57:35.123Z".
Fill the lacking information. For example if user gave only year and month ex. 2020.03 create valid string "2020-03-01T00:00:00.000Z".
If only year was given consider ex. 2002 consider it "2002-01-01T00:00:00.000Z".
Sort the timestamps to assign the higher one to upperThreshold and lower to lowerThreshold.
Thresholds are optional! If not provided at all pass null values to returned JSON.

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. Only topicId is not nullable:
\`\`\`json
{
    "topicId": string,
    "lowerThreshold": string,
    "upperThreshold": string,
}
\`\`\`

Example response for the input: "Show me messages from topic 0.0.123456", the response should be:
\`\`\`json
{
    "topicId": "0.0.123456",
    "lowerThreshold: null,
    "upperThreshold": null,
}
\`\`\`

Example response for the input: "Show me messages from topic 0.0.123456. I want only the one that were posted after 2 January 2025", the response should be:
\`\`\`json
{
    "topicId": "0.0.123456",
    "lowerThreshold: "2025-01-02T00:00:00.000Z",
    "upperThreshold": null,
}
\`\`\`

Example response for the input: "Show me messages from topic 0.0.123456 posted between 20 January 2025 12:50:30.123 and 5 march 2024 13:40", the response should be:
\`\`\`json
{
    "topicId": "0.0.5423966",
    "lowerThreshold: "2024-03-05T13:40:00.000Z",
    "upperThreshold": "2025-01-20T12:50:30.123",
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var mintTokenTemplate = `Given the recent messages and wallet information below:
{{recentMessages}}
{{walletInfo}}

Extract the following information about message to submit to topic request:
1. **Token Id**:
   - must be a string. Do not include dot after last character. Example of correct topicId: "0.0.539314".

2. **Amount**:
   - Must be a number.
   - amount of tokens that will be minted

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields are required:
\`\`\`json
{
    "tokenId": string,
    "amount": string
}
\`\`\`

Example response for the input: "Mint 12345 tokens 0.0.5423981", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5423981",
    "amount": 12345
}
\`\`\`

Example response for the input: "Increase supply of token 0.0.5423991 by 100000", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5423991",
    "amount": 100000
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var getSpendingAllowanceTemplate = `Given the wallet information below:
{{walletInfo}}

And last message from user in {{recentMessages}}

Extract the following information about spending allowance:
1. **SpenderAccountId*:
   - must be a string. Do not include dot after last character. Example of correct spenderAccountId: "0.0.539314".

2. **Amount**:
   - Must be a number.
   - amount of tokens/HBAR that will be allowed for spending by the spender
3. **TokenId**:
   - must be a string. Do not include dot after last character. Example of correct tokenId: "0.0.539314".
   - is optional
   - do not include it if was not passed
   - do not include it if user sets allowance for HBAR spending

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields except **tokenId** are required:
\`\`\`json
{
    "spenderAccountId": string,
    "amount": number,
    "tokenId": string
}
\`\`\`

Example response for the input: "Set spending approval for an account 0.0.123456 for 123 HBAR.", the response should be:
\`\`\`json
{
    "spenderAccountId": "0.0.123456",
    "amount": 123
}
\`\`\`

Example response for the input: "Set spending approval for an account 0.0.123456 for 123 tokens 0.0.2222222.", the response should be:
\`\`\`json
{
    "spenderAccountId": "0.0.123456",
    "amount": 123,
    "tokenId": "0.0.2222222"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;
var mintNFTTokenTemplate = `Given the wallet information:
{{walletInfo}}
And using last user message from: {{recentMessages}}. 

Extract the following information about minting NFT token:
1. **Token Id**:
   - must be a string. Do not include dot after last character. Example of correct topicId: "0.0.539314".

2. **TokenMetadata**:
   - Must be a string.
   - contains metadata that will be assigned to minted token

Always look at the latest message from user and try to extract data from it!
Respond with a JSON markdown block containing only the extracted values. All fields are required:
\`\`\`json
{
    "tokenId": string,
    "tokenMetadata": string
}
\`\`\`

Example response for the input: "Mint NFT 0.0.5423981 with metadata 'This is the tokens metadata'.", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5423981",
    "TokenMetadata": "This is the tokens metadata"
}
\`\`\`

Example response for the input: "Mint new NFT token. Set it's metadata to 'https://example.com/nft-image.png'", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5423991",
    "TokenMetadata": "https://example.com/nft-image.png"
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;

// src/actions/balance-hbar/balance-hbar.ts
var balanceHbarAction = {
  name: "HEDERA_HBAR_BALANCE",
  description: "Returns HBAR balance of requested wallet",
  handler: async (_runtime, _message, state, _options, _callback) => {
    const hederaHbarBalanceContext = composeContext({
      state,
      template: balanceHbarTemplate,
      templatingEngine: "handlebars"
    });
    const hederaHbarBalanceContent = await generateObjectDeprecated({
      runtime: _runtime,
      context: hederaHbarBalanceContext,
      modelClass: ModelClass.SMALL
    });
    const paramOptions = {
      symbol: hederaHbarBalanceContent.symbol,
      address: hederaHbarBalanceContent.address
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaHbarBalanceParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        throw new Error(
          `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(_runtime);
      const action = new HbarBalanceActionService(hederaProvider);
      const response = await action.execute(paramOptions);
      if (_callback && response.status === "SUCCESS" /* SUCCESS */) {
        await _callback({
          text: `Address ${paramOptions.address} has balance of ${response.balance} HBAR`,
          content: {
            success: true,
            amount: response.balance,
            address: paramOptions.address,
            symbol: "HBAR"
          }
        });
      }
      return true;
    } catch (error) {
      console.error("Error during fetching balance:", error);
      if (_callback) {
        await _callback({
          text: `Error during fetching balance: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: balanceHbarTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me HBAR balance of wallet {{0.0.5423981}}",
          action: "HEDERA_HBAR_BALANCE"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_HBAR_BALANCE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Whats HBAR balance of wallet {{0.0.5423981}}",
          action: "HEDERA_HBAR_BALANCE"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_HBAR_BALANCE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me HBAR balance of wallet 0.0.5423949. Call HEDERA_HBAR_BALANCE action",
          action: "HEDERA_HBAR_BALANCE"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_HBAR_BALANCE"
        }
      }
    ]
  ],
  similes: ["HBAR_BALANCE"]
};

// src/actions/balance-hts/balance-hts.ts
import {
  composeContext as composeContext2,
  generateObjectDeprecated as generateObjectDeprecated2,
  ModelClass as ModelClass2
} from "@elizaos/core";

// src/actions/balance-hts/schema.ts
import { z as z2 } from "zod";
var hederaHtsBalanceParamsSchema = z2.object({
  tokenId: z2.string(),
  address: z2.string()
});

// src/actions/balance-hts/services/hts-balance-action-service.ts
import { toDisplayUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";
var HtsBalanceActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const balance = await agentKit.getHtsBalance(
      params.tokenId,
      networkType,
      params.address
    );
    const tokenDetails = await agentKit.getHtsTokenDetails(
      params.tokenId,
      networkType
    );
    return {
      status: "SUCCESS" /* SUCCESS */,
      balance: await toDisplayUnit(
        params.tokenId,
        balance,
        networkType
      ).then((b) => b.toString()),
      unit: tokenDetails.name,
      symbol: tokenDetails.symbol
    };
  }
};

// src/actions/balance-hts/balance-hts.ts
var balanceHtsAction = {
  name: "HEDERA_HTS_BALANCE",
  description: "Returns provided HTS token balance for requested wallet",
  handler: async (runtime, _message, state, _options, callback) => {
    const hederaHtsBalanceContext = composeContext2({
      state,
      template: balanceHtsTemplate,
      templatingEngine: "handlebars"
    });
    const hederaHtsBalanceContent = await generateObjectDeprecated2({
      runtime,
      context: hederaHtsBalanceContext,
      modelClass: ModelClass2.SMALL
    });
    const paramOptions = {
      tokenId: hederaHtsBalanceContent.tokenId,
      address: hederaHtsBalanceContent.address
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaHtsBalanceParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        throw new Error(
          `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new HtsBalanceActionService(hederaProvider);
      const response = await action.execute(
        paramOptions,
        networkType
      );
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        await callback({
          text: `Address ${paramOptions.address} has balance of token ${response.unit} equal ${response.balance} ${response.symbol} (token id: ${paramOptions.tokenId})`,
          content: {
            success: true,
            amount: response.balance,
            address: paramOptions.address,
            symbol: response.unit
          }
        });
      }
      return true;
    } catch (error) {
      console.error(
        "Error during fetching HTS token balance:",
        error
      );
      if (callback) {
        await callback({
          text: `Error during fetching HTS token balance: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: balanceHtsTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me balance of token {{0.0.5424086}} for wallet {{0.0.5423981}}",
          action: "HEDERA_HTS_BALANCE"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_HTS_BALANCE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Whats {{0.0.5422544}} balance for wallet {{0.0.5423981}}",
          action: "HEDERA_HTS_BALANCE"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_HTS_BALANCE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me balance of hts-token with id 0.0.5422268 for wallet 0.0.5423949. Call HEDERA_HTS_BALANCE action",
          action: "HEDERA_HTS_BALANCE"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_HTS_BALANCE"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me balance of hts token with id {{0.0.5422268}} for wallet {{0.0.5423949}}.",
          action: "HEDERA_HTS_BALANCE"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_HTS_BALANCE"
        }
      }
    ]
  ],
  similes: ["HTS_BALANCE", "HTS_AMOUNT", "HTS_BALANCE_HEDERA"]
};

// src/actions/balances-all-tokens/balance-all-tokens.ts
import {
  composeContext as composeContext3,
  generateObjectDeprecated as generateObjectDeprecated3,
  ModelClass as ModelClass3
} from "@elizaos/core";

// src/actions/balances-all-tokens/schema.ts
import { z as z3 } from "zod";
var hederaAllTokensBalancesParamsSchema = z3.object({
  address: z3.string().optional().nullable()
});

// src/actions/balances-all-tokens/services/all-tokens-balances-action-service.ts
var AllTokensBalancesActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    if (!params.address) {
      throw new Error("No receiver address");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const balancesArray = await agentKit.getAllTokensBalances(networkType, params.address);
    return {
      status: "SUCCESS" /* SUCCESS */,
      balancesArray
    };
  }
};

// src/actions/balances-all-tokens/balance-all-tokens.ts
var balancesAllTokensAction = {
  name: "HEDERA_ALL_BALANCES",
  description: "Returns balances of all tokens for requested wallet or agent's wallet if no specific wallet provided",
  handler: async (runtime, _message, state, _options, _callback) => {
    const hederaAllTokensBalancesContext = composeContext3({
      state,
      template: balancesAllTokensTemplate,
      templatingEngine: "handlebars"
    });
    const hederaAllTokensBalancesContent = await generateObjectDeprecated3({
      runtime,
      context: hederaAllTokensBalancesContext,
      modelClass: ModelClass3.SMALL
    });
    const paramOptions = {
      address: hederaAllTokensBalancesContent.address
    };
    try {
      const validationResult = hederaAllTokensBalancesParamsSchema.safeParse(paramOptions);
      console.log(
        `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
      );
      if (!validationResult.success) {
        throw new Error(
          `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
        );
      }
      if (!paramOptions.address) {
        console.warn(
          `LLM couldn't extract agent's wallet from state. Manually assigning connected wallet address.`
        );
        paramOptions.address = runtime.getSetting("HEDERA_ACCOUNT_ID");
      }
      const hederaProvider = new HederaProvider(runtime);
      const action = new AllTokensBalancesActionService(hederaProvider);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const response = await action.execute(
        paramOptions,
        networkType
      );
      let text = "";
      for (const balance of response.balancesArray) {
        text += `${balance.tokenName}: ${balance.balanceInDisplayUnit} ${balance.tokenSymbol} (${balance.tokenId})
`;
      }
      if (_callback && response.status === "SUCCESS" /* SUCCESS */) {
        if (text === "") {
          await _callback({
            text: `Address ${paramOptions.address} does not have any token balances.`,
            content: {
              success: true,
              amount: response.balancesArray,
              address: paramOptions.address
            }
          });
        } else {
          await _callback({
            text: `Address ${paramOptions.address} has following token balances:
${text}`,
            content: {
              success: true,
              amount: response.balancesArray,
              address: paramOptions.address
            }
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error during fetching balance:", error);
      if (_callback) {
        await _callback({
          text: `Error during fetching balance: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: balancesAllTokensTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me the token balances for wallet {{0.1.123123}}.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me the balances of all HTS tokens for wallet {{0.0.123123}}.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "What are the HTS token balances for wallet {{0.0.123123}}?",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "What are your HTS token balances?",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me your HTS token balances.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you display all token balances for wallet {{0.0.543210}}?",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I need the HTS token balances for wallet {{0.0.987654}}.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Retrieve all HTS token balances for account {{0.0.135790}}.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Please fetch the HTS token balances for wallet {{0.0.246802}}.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Get the token balances for the account {{0.0.112233}}.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you show me all token balances associated with wallet {{0.0.556677}}?",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Fetch the HTS token balances for account ID {{0.0.778899}}.",
          action: "HEDERA_ALL_BALANCES"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ALL_BALANCES"
        }
      }
    ]
  ],
  similes: ["ALL_TOKENS_BALANCE"]
};

// src/actions/transfer/transfer.ts
import {
  composeContext as composeContext4,
  generateObjectDeprecated as generateObjectDeprecated4,
  ModelClass as ModelClass4
} from "@elizaos/core";

// src/actions/transfer/services/transfer-hbar.ts
var TransferHbarService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute({
    amount,
    accountId
  }) {
    if (!amount) {
      throw new Error("Missing amount");
    }
    if (!accountId) {
      throw new Error("Missing recipient accountId");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return agentKit.transferHbar(accountId, amount);
  }
};

// src/actions/transfer/schema.ts
import { z as z4 } from "zod";
var transferDataParamsSchema = z4.object({
  amount: z4.string(),
  accountId: z4.string()
});

// src/shared/utils.ts
import { z as z5 } from "zod";
function convertTimestampToUTC(timestamp) {
  const [seconds, nanos] = timestamp.split(".").map(Number);
  const milliseconds = Math.round(nanos / 1e6);
  return new Date(seconds * 1e3 + milliseconds).toISOString();
}
var generateHashscanUrl = (txHash, networkType) => {
  return `https://hashscan.io/${networkType}/tx/${txHash}`;
};
function convertStringToTimestamp(input) {
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  const timestamp = date.getTime();
  return parseFloat((timestamp / 1e3).toFixed(6));
}
var castToBoolean = z5.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
    else return false;
  }
  return val;
}, z5.boolean());
var castToNull = (value) => value === "null" ? null : value;

// src/actions/transfer/transfer.ts
var transferAction = {
  name: "TRANSFER_HBAR",
  description: "Transfer HBAR between addresses on the same chain",
  handler: async (runtime, _message, state, _options, callback) => {
    try {
      const hederaTransferContext = composeContext4({
        state,
        template: hederaHBARTransferTemplate,
        templatingEngine: "handlebars"
      });
      const hederaTransferContent = await generateObjectDeprecated4({
        runtime,
        context: hederaTransferContext,
        modelClass: ModelClass4.SMALL
      });
      console.log(
        `Extracted data: ${JSON.stringify(hederaTransferContent, null, 2)}`
      );
      const hederaTransferData = transferDataParamsSchema.parse(
        hederaTransferContent
      );
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const transferHbarService = new TransferHbarService(hederaProvider);
      const response = await transferHbarService.execute(hederaTransferData);
      if (callback && response.status === "SUCCESS") {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Transfer of ${hederaTransferData.amount} HBAR to ${hederaTransferData.accountId} completed.
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during HBAR transfer:", error);
      await callback({
        text: `Error during HBAR transfer: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user}}",
        content: {
          text: "Transfer {{1}} HBAR to {{0.0.4515512}}",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Send {{10.5}} HBAR to account {{0.0.987654}}.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Move {{0.75}} HBAR to {{0.0.1234567}} now.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "I want to transfer {{5}} HBAR to {{0.0.7654321}}.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Can you send {{3.25}} HBAR to {{0.0.5555555}}?",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Transfer exactly {{8.8}} HBAR to {{0.0.9999999}}.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Make a transaction of {{15}} HBAR to {{0.0.6666666}}.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Please transfer {{2}} HBAR to {{0.0.3333333}} ASAP.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Move {{12.5}} HBAR from my wallet to {{0.0.2222222}}.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Send exactly {{50}} HBAR to {{0.0.7777777}}, please.",
          action: "TRANSFER_HBAR"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "TRANSFER_HBAR"
        }
      }
    ]
  ],
  similes: ["SEND_HBAR", "HBAR_TRANSFER", "MOVE_HBAR"]
};

// src/actions/create-token/create-token.ts
import {
  composeContext as composeContext5,
  generateObjectDeprecated as generateObjectDeprecated5,
  ModelClass as ModelClass5
} from "@elizaos/core";

// src/actions/create-token/services/create-token.ts
var CreateTokenService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    if (!params.name) {
      throw new Error("Missing name of token");
    }
    if (!params.symbol) {
      throw new Error("Missing symbol of token");
    }
    if (!params.decimals) {
      throw new Error("Missing decimals of token");
    }
    if (!params.initialSupply) {
      throw new Error("Missing initial supply of token");
    }
    if (params.isSupplyKey == null) {
      params.isSupplyKey = false;
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const initialSupplyBaseUnit = params.initialSupply * 10 ** params.decimals;
    const options = {
      symbol: params.symbol,
      name: params.name,
      decimals: params.decimals,
      initialSupply: initialSupplyBaseUnit,
      isSupplyKey: params.isSupplyKey,
      isMetadataKey: params.isMetadataKey,
      isAdminKey: params.isAdminKey,
      tokenMetadata: new TextEncoder().encode(params.tokenMetadata),
      memo: params.memo
    };
    return agentKit.createFT(options);
  }
};

// src/actions/create-token/schema.ts
import { z as z6 } from "zod";
var createTokenParamsSchema = z6.object({
  symbol: z6.string(),
  name: z6.string(),
  decimals: z6.coerce.number(),
  initialSupply: z6.coerce.number(),
  isSupplyKey: castToBoolean,
  isMetadataKey: castToBoolean,
  isAdminKey: castToBoolean,
  tokenMetadata: z6.string().optional().nullable().transform(castToNull),
  memo: z6.string().optional().nullable().transform(castToNull)
});

// src/actions/create-token/utils.ts
var createFTDetailsDescription = (params) => {
  const name = `Name: ${params.name}`;
  const symbol = `Symbol: ${params.symbol}`;
  const decimals = `Decimals: ${params.decimals}`;
  const initialSupply = `Initial supply: ${params.initialSupply}`;
  const isSupplyKey = `Supply Key: ${params.isMetadataKey === void 0 || !params.isSupplyKey ? "not set" : "Enabled"}`;
  const isMetadataKey = `Metadata Key: ${params.isMetadataKey === void 0 || !params.isMetadataKey ? "not set" : "Enabled"}`;
  const isAdminKey = `Admin Key: ${params.isAdminKey === void 0 || !params.isAdminKey ? "not set" : "Enabled"}`;
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

// src/actions/create-token/create-token.ts
var createTokenAction = {
  name: "HEDERA_CREATE_TOKEN",
  description: "Create a new fungible token on the Hedera network",
  handler: async (runtime, _message, state, _options, callback) => {
    try {
      const hederaCreateTokenContext = composeContext5({
        state,
        template: hederaCreateTokenTemplate,
        templatingEngine: "handlebars"
      });
      const hederaCreateTokenContent = await generateObjectDeprecated5({
        runtime,
        context: hederaCreateTokenContext,
        modelClass: ModelClass5.SMALL
      });
      const createTokenData = createTokenParamsSchema.parse(
        hederaCreateTokenContent
      );
      console.log(
        `Extracted data: ${JSON.stringify(createTokenData, null, 2)}`
      );
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const createTokenService = new CreateTokenService(hederaProvider);
      const response = await createTokenService.execute(createTokenData);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: [
            `Created a new fungible token!`,
            `Token ID: ${response.tokenId.toString()}`,
            ``,
            `Details:`,
            `${createFTDetailsDescription(createTokenData)}`,
            ``,
            `Transaction link: ${url}`
          ].join("\n")
        });
      }
      return true;
    } catch (error) {
      console.error("Error during token creation:", error);
      await callback({
        text: `Error during token creation: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user}}",
        content: {
          text: "Create new token with name {{MyToken}} with symbol {{MTK}}, {{8}} decimals and {{1000}} initial supply.",
          action: "HEDERA_CREATE_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Create a new token named {{HederaDollar}} with ticker {{H$}}, {{4}} decimals, and {{1000000}} initial supply. I want to set the supply key so I could add more tokens later.",
          action: "HEDERA_CREATE_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Create token {{GameGold}} with symbol {{GG}}, {{2}} decimal places, and starting supply of {{750000}}. This is the final supply, don\u2019t set a supply key.",
          action: "HEDERA_CREATE_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Deploy a token named {{SuperToken}} with short code {{STK}}, {{5}} decimal places, and an issuance of {{100000}}. No additional tokens will be minted.",
          action: "HEDERA_CREATE_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Create new HTS token {{PixelCoin}} with symbol {{PXN}}, {{3}} decimal places, and {{500}} tokens minted. I want to control supply changes, so set the supply key.",
          action: "HEDERA_CREATE_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Launch a new HTS token called {{SkyCredits}} with ticker {{SKC}}, {{9}} decimal places, and a total supply of {{25000}}. The supply is fixed.",
          action: "HEDERA_CREATE_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_TOKEN"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_NEW_TOKEN",
    "HEDERA_CREATE_NEW_TOKEN",
    "HEDERA_NEW_FUNGIBLE_TOKEN"
  ]
};

// src/actions/associate-token/associate-token.ts
import {
  composeContext as composeContext6,
  generateObjectDeprecated as generateObjectDeprecated6,
  ModelClass as ModelClass6
} from "@elizaos/core";

// src/actions/associate-token/schema.ts
import { z as z7 } from "zod";
var hederaAssociateTokenParamsSchema = z7.object({
  tokenId: z7.string()
});

// src/actions/associate-token/service/associate-token-action-service.ts
import { TokenId } from "@hashgraph/sdk";
var AssociateTokenActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    if (!params.tokenId) {
      throw new Error("No token id");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return await agentKit.associateToken(
      TokenId.fromString(params.tokenId)
    );
  }
};

// src/actions/associate-token/associate-token.ts
var associateTokenAction = {
  name: "HEDERA_ASSOCIATE_TOKEN",
  description: "Associates provided token with given account",
  handler: async (runtime, _message, state, _options, _callback) => {
    const hederaAssociateTokenContext = composeContext6({
      state,
      template: associateTokenTemplate,
      templatingEngine: "handlebars"
    });
    const hederaAssociateTokenContent = await generateObjectDeprecated6({
      runtime,
      context: hederaAssociateTokenContext,
      modelClass: ModelClass6.SMALL
    });
    const paramOptions = {
      tokenId: hederaAssociateTokenContent.tokenId
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaAssociateTokenParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        throw new Error(
          `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new AssociateTokenActionService(hederaProvider);
      const response = await action.execute(paramOptions);
      if (_callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await _callback({
          text: `Token ${paramOptions.tokenId} has been associated with the account.
Transaction link: ${url}`,
          content: {
            success: true,
            tokenId: paramOptions.tokenId
          }
        });
      }
      return true;
    } catch (error) {
      console.error(
        `Error during associating token ${paramOptions.tokenId}:`,
        error
      );
      if (_callback) {
        await _callback({
          text: `Error during associating token ${paramOptions.tokenId}: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: associateTokenTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Associate my wallet with token {{0.0.123456}}.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN",
          tokenId: "0.0.123456"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you link my wallet to token {{0.0.654321}}?",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to associate my wallet with token {{0.0.987654}}.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Please associate my account with token {{0.0.111222}}.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Connect my wallet to token {{0.0.333444}}.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Could you link token {{0.0.555666}} to my wallet?",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Attach token {{0.0.777888}} to my wallet.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Make my wallet associated with token {{0.0.999000}}.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I\u2019d like to link token {{0.0.112233}} with my wallet.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Help me associate token {{0.0.445566}} to my wallet.",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_ASSOCIATE_TOKEN"
        }
      }
    ]
  ],
  similes: ["HEDERA_ASSOCIATE_HTS"]
};

// src/actions/token-holders/token-holders.ts
import {
  composeContext as composeContext7,
  generateObjectDeprecated as generateObjectDeprecated7,
  ModelClass as ModelClass7
} from "@elizaos/core";

// src/actions/token-holders/schema.ts
import { z as z8 } from "zod";
var hederaTokenHoldersParamsSchema = z8.object({
  tokenId: z8.string(),
  threshold: z8.coerce.number().optional()
});

// src/actions/token-holders/services/token-holders-action-service.ts
import { toBaseUnit } from "hedera-agent-kit/dist/utils/hts-format-utils";
var TokenHoldersActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    if (!params.tokenId) {
      throw new Error("No token id provided!");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const thresholdBaseUnit = params.threshold ? await toBaseUnit(
      params.tokenId,
      params.threshold,
      networkType
    ).then((num) => num.toNumber()) : void 0;
    const balancesArray = await agentKit.getTokenHolders(
      params.tokenId,
      networkType,
      thresholdBaseUnit
    );
    const tokenDetails = await agentKit.getHtsTokenDetails(
      params.tokenId,
      networkType
    );
    return {
      status: "SUCCESS" /* SUCCESS */,
      tokenId: params.tokenId,
      tokenName: tokenDetails.name,
      tokenSymbol: tokenDetails.symbol,
      tokenDecimals: Number(tokenDetails.decimals),
      holdersArray: balancesArray
    };
  }
};

// src/actions/token-holders/token-holders.ts
import { toDisplayUnit as toDisplayUnit2 } from "hedera-agent-kit/dist/utils/hts-format-utils";
var tokenHoldersAction = {
  name: "HEDERA_TOKEN_HOLDERS",
  description: "Returns holders of provided token with their balances. Can accept optional parameter for filtering accounts with greater or equal amount of tokens.",
  handler: async (runtime, _message, state, _options, _callback) => {
    const hederaTokenHoldersContext = composeContext7({
      state,
      template: tokenHoldersTemplate,
      templatingEngine: "handlebars"
    });
    const hederaTokenHoldersContent = await generateObjectDeprecated7({
      runtime,
      context: hederaTokenHoldersContext,
      modelClass: ModelClass7.MEDIUM
    });
    const paramOptions = {
      tokenId: hederaTokenHoldersContent.tokenId,
      threshold: hederaTokenHoldersContent.threshold
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaTokenHoldersParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        throw new Error(
          `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const action = new TokenHoldersActionService(hederaProvider);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const result = await action.execute(
        paramOptions,
        networkType
      );
      let text = "";
      for (const holder of result.holdersArray) {
        const displayBalance = await toDisplayUnit2(
          result.tokenId,
          holder.balance,
          networkType
        ).then((b) => b.toString());
        text += `${holder.account}: ${displayBalance} ${result.tokenSymbol}
`;
      }
      if (_callback && result.status === "SUCCESS" /* SUCCESS */) {
        if (text === "") {
          await _callback({
            text: `Token ${paramOptions.tokenId} (${result.tokenName}) does not have any holders.`,
            content: {
              success: true,
              holdersArray: result.holdersArray,
              tokenId: paramOptions.tokenId
            }
          });
        } else {
          await _callback({
            text: `Token ${paramOptions.tokenId} (${result.tokenName}) has following holders:
${text}`,
            content: {
              success: true,
              holdersArray: result.holdersArray,
              tokenId: paramOptions.tokenId
            }
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error during fetching balance:", error);
      if (_callback) {
        await _callback({
          text: `Error during fetching balance: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: tokenHoldersTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Who owns token {{0.0.54321}} and what are their balances?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you show me the token holders for {{0.0.987654}}?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Give me a list of wallets holding token {{0.0.246810}}.",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Which wallets have token {{0.0.13579}} and how many tokens do they hold?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me the balance of token {{0.0.987654}} across all wallets.",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Who holds token {{0.0.864209}} and how much of it do they have?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "What is the token holder distribution for token {{0.0.123456}}?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Please provide the details of wallets holding token {{0.1.112233}}.",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me the token holders for {{0.0.123456}} with balances greater or equal 1000.",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Which wallets hold token {{0.0.654321}} and have at least 5000 tokens?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Give me a list of wallets holding token {{0.0.111111}} with minimum 100 tokens.",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you provide details of wallets owning token {{0.0.222222}} with balances equal or above 2000?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Who holds token {{0.0.333333}} and has a balance greater than or equal 10000?",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Find wallets with token {{0.0.444444}} that have at least 500 tokens.",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Who owns token {{0.0.555555}}? Only show wallets with at least 750 tokens.",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOKEN_HOLDERS"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_TOKEN_HOLDERS_BY_THRESHOLD",
    "HEDERA_ALL_TOKEN_HOLDERS",
    "HEDERA_HTS_HOLDERS"
  ]
};

// src/actions/airdrop-token/airdrop-token.ts
import {
  composeContext as composeContext8,
  generateObjectDeprecated as generateObjectDeprecated8,
  ModelClass as ModelClass8
} from "@elizaos/core";

// src/actions/airdrop-token/schema.ts
import { z as z9 } from "zod";
var airdropTokenParamsSchema = z9.object({
  tokenId: z9.string(),
  recipients: z9.array(z9.string()),
  amount: z9.coerce.number()
});

// src/actions/airdrop-token/services/airdrop-token.ts
import { TokenId as TokenId2 } from "@hashgraph/sdk";
import { toBaseUnit as toBaseUnit2 } from "hedera-agent-kit/dist/utils/hts-format-utils";
var AirdropTokenService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    if (!params.tokenId) {
      throw new Error("Missing tokenId");
    }
    if (!params.recipients || !params.recipients.length) {
      throw new Error("Missing recipients");
    }
    if (!params.amount) {
      throw new Error("Missing amount to airdrop");
    }
    const tokenId = TokenId2.fromString(params.tokenId);
    const recipients = await Promise.all(
      params.recipients.map(async (r) => ({
        accountId: r,
        amount: (await toBaseUnit2(
          tokenId.toString(),
          params.amount,
          networkType
        )).toNumber()
      }))
    );
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return await agentKit.airdropToken(tokenId, recipients);
  }
};

// src/actions/airdrop-token/airdrop-token.ts
var airdropTokenAction = {
  name: "HEDERA_AIRDROP_TOKEN",
  description: "Airdrop a token on the Hedera network",
  handler: async (runtime, _message, state, _options, callback) => {
    try {
      const hederaAirdropTokenContext = composeContext8({
        state,
        template: hederaAirdropTokenTemplate,
        templatingEngine: "handlebars"
      });
      const hederaAirdropTokenContent = await generateObjectDeprecated8({
        runtime,
        context: hederaAirdropTokenContext,
        modelClass: ModelClass8.SMALL
      });
      console.log(
        `Extracted data: ${JSON.stringify(hederaAirdropTokenContent, null, 2)}`
      );
      const airdropTokenData = airdropTokenParamsSchema.parse(
        hederaAirdropTokenContent
      );
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const airdropTokenService = new AirdropTokenService(hederaProvider);
      const response = await airdropTokenService.execute(
        airdropTokenData,
        networkType
      );
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Airdrop token successfully executed.
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during token airdrop:", error);
      await callback({
        text: `Error during token airdrop: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user}}",
        content: {
          text: "Airdrop {{10}} tokens {{0.0.5426001}} for {{0.0.5399001}}, {{0.0.5399012}}, {{0.0.5399023}}",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Airdrop {{3.75}} tokens {{0.0.5432002}} to wallets {{0.0.5401005}}, {{0.0.5402006}}, {{0.0.5403007}}, {{0.0.5404008}}",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Send a token airdrop of {{15}} tokens with id {{0.0.5427890}} to {{0.0.5412345}}, {{0.0.5416789}}",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Airdrop {{7.2}} tokens {{0.0.5436781}} to {{0.0.5401122}}, {{0.0.5402233}}, {{0.0.5403344}}, {{0.0.5404455}}, {{0.0.5405566}}",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Make airdrop of {{20}} tokens (token id: {{0.0.5456789}}) to multiple wallets: {{0.0.5410001}}, {{0.0.5410002}}, {{0.0.5410003}}, {{0.0.5410004}}, {{0.0.5410005}}",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_AIRDROP_TOKEN"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_DROP_TOKEN",
    "HEDERA_DROP_TOKENS",
    "HEDERA_AIRDROP_TOKENS"
  ]
};

// src/actions/reject-token/reject-token.ts
import {
  composeContext as composeContext9,
  generateObjectDeprecated as generateObjectDeprecated9,
  ModelClass as ModelClass9
} from "@elizaos/core";

// src/actions/reject-token/schema.ts
import { z as z10 } from "zod";
var hederaRejectTokenParamsSchema = z10.object({
  tokenId: z10.string()
});

// src/actions/reject-token/service/reject-token-action-service.ts
import { TokenId as TokenId3 } from "@hashgraph/sdk";
var RejectTokenActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return await agentKit.rejectToken(TokenId3.fromString(params.tokenId));
  }
};

// src/actions/reject-token/reject-token.ts
var rejectTokenAction = {
  name: "HEDERA_REJECT_TOKEN",
  description: "Action for rejecting HTS token airdropped to an account",
  handler: async (runtime, _message, state, _options, _callback) => {
    const hederaRejectTokenContext = composeContext9({
      state,
      template: rejectTokenTemplate,
      templatingEngine: "handlebars"
    });
    const hederaRejectTokenContent = await generateObjectDeprecated9({
      runtime,
      context: hederaRejectTokenContext,
      modelClass: ModelClass9.SMALL
    });
    const paramOptions = {
      tokenId: hederaRejectTokenContent.tokenId
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaRejectTokenParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        throw new Error(
          `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new RejectTokenActionService(hederaProvider);
      const response = await action.execute(paramOptions);
      if (_callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await _callback({
          text: `Successfully rejected token: ${paramOptions.tokenId}.
Transaction link: ${url}`,
          content: {
            success: true,
            tokenId: paramOptions.tokenId
          }
        });
      }
      return true;
    } catch (error) {
      console.error(
        `Error rejecting token: ${paramOptions.tokenId}.`,
        error
      );
      if (_callback) {
        await _callback({
          text: `Error rejecting token ${paramOptions.tokenId}.
Error: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: rejectTokenTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Reject token {{0.0.5424086}}.",
          action: "HEDERA_REJECT_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_REJECT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I don't want to accept the token {{0.0.542086}} from airdrop. Reject it.",
          action: "HEDERA_REJECT_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_REJECT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Remove airdropped token {{0.0.654321}} from my account.",
          action: "HEDERA_REJECT_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_REJECT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I do not wish to receive token {{0.0.112233}}. Reject it immediately.",
          action: "HEDERA_REJECT_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_REJECT_TOKEN"
        }
      }
    ]
  ],
  similes: ["HEDERA_REJECT_AIRDROP", "HEDERA_REJECT_HTS", "REJECT_HTS"]
};

// src/actions/pending-airdrops/pending-airdrops.ts
import {
  composeContext as composeContext10,
  generateObjectDeprecated as generateObjectDeprecated10,
  ModelClass as ModelClass10
} from "@elizaos/core";

// src/actions/pending-airdrops/schema.ts
import { z as z11 } from "zod";
var pendingAirdropsParams = z11.object({
  accountId: z11.string().nullable()
});

// src/actions/pending-airdrops/services/get-pending-airdrops.ts
var GetPendingAirdropsService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(accountId, networkType) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return await agentKit.getPendingAirdrops(accountId, networkType);
  }
};

// src/actions/pending-airdrops/pending-airdrops.ts
import { toDisplayUnit as toDisplayUnit3 } from "hedera-agent-kit/dist/utils/hts-format-utils";
import { get_hts_token_details } from "hedera-agent-kit/dist/tools/hts/queries";
var pendingAirdropsAction = {
  name: "HEDERA_PENDING_AIRDROPS",
  description: "Returns currently pending airdrops for accountId",
  handler: async (runtime, _message, state, _options, callback) => {
    const pendingAirdropsContext = composeContext10({
      state,
      template: pendingAirdropTemplate,
      templatingEngine: "handlebars"
    });
    const pendingAirdropContent = await generateObjectDeprecated10({
      runtime,
      context: pendingAirdropsContext,
      modelClass: ModelClass10.SMALL
    });
    console.log(
      `Extracted data: ${JSON.stringify(pendingAirdropsContext, null, 2)}`
    );
    try {
      const pendingAirdropData = pendingAirdropsParams.parse(
        pendingAirdropContent
      );
      const accountId = pendingAirdropData.accountId || runtime.getSetting("HEDERA_ACCOUNT_ID");
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const hederaProvider = new HederaProvider(runtime);
      const action = new GetPendingAirdropsService(hederaProvider);
      const pendingAirdrops = await action.execute(
        accountId,
        networkType
      );
      if (!pendingAirdrops.length) {
        await callback({
          text: `There are no pending airdrops for accountId ${accountId}`,
          content: `There are no pending airdrops for accountId ${accountId}`
        });
        return true;
      }
      const formatedAirdrops = await Promise.all(
        pendingAirdrops.map(async (airdrop, index) => {
          const tokenDetails = await get_hts_token_details(
            airdrop.token_id,
            networkType
          );
          const displayAmount = await toDisplayUnit3(
            airdrop.token_id,
            airdrop.amount,
            networkType
          );
          return `(${index + 1}) ${displayAmount.toString()} ${tokenDetails.symbol} (token id: ${airdrop.token_id}) from ${airdrop.sender_id}`;
        })
      ).then((results) => results.join("\n"));
      await callback({
        text: `Here are pending airdrops for account ${accountId} 

 ${formatedAirdrops}`,
        content: {
          availableAirdrops: pendingAirdrops
        }
      });
      return true;
    } catch (error) {
      console.error("Error during fetching pending airdrops:", error);
      if (callback) {
        await callback({
          text: `Error during fetching pending airdrops: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me pending airdrops for account {{0.0.5393076}}",
          action: "HEDERA_PENDING_AIRDROPS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_PENDING_AIRDROPS"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Show me my pending airdrops",
          action: "HEDERA_PENDING_AIRDROPS"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_PENDING_AIRDROPS"
        }
      }
    ]
  ],
  similes: ["PENDING_AIRDROPS", "GET_AIRDROPS", "GET_PENDING_AIRDROPS"]
};

// src/actions/claim-airdrop/claim-airdrop.ts
import {
  composeContext as composeContext11,
  generateObjectDeprecated as generateObjectDeprecated11,
  ModelClass as ModelClass11
} from "@elizaos/core";

// src/actions/claim-airdrop/schema.ts
import { z as z12 } from "zod";
var claimAirdropParamsSchema = z12.object({
  senderId: z12.string(),
  tokenId: z12.string()
});

// src/actions/claim-airdrop/services/claim-airdrop-service.ts
import { AccountId, PendingAirdropId, TokenId as TokenId4 } from "@hashgraph/sdk";
var ClaimAirdropService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params, accountId) {
    if (!params.tokenId) {
      throw new Error("No tokenId provided");
    }
    if (!params.senderId) {
      throw new Error("No senderId provided");
    }
    if (!accountId) {
      throw new Error("No accountId provided");
    }
    const tokenId = TokenId4.fromString(params.tokenId);
    const senderId = AccountId.fromString(params.senderId);
    const receiverId = AccountId.fromString(accountId);
    const pendingAirdrop = new PendingAirdropId({
      senderId,
      tokenId,
      receiverId
    });
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return agentKit.claimAirdrop(pendingAirdrop);
  }
};

// src/actions/claim-airdrop/claim-airdrop.ts
var claimAirdropAction = {
  name: "HEDERA_CLAIM_AIRDROP",
  description: "Claim available pending token airdrop",
  handler: async (runtime, _message, state, _options, callback) => {
    const claimAirdropContext = composeContext11({
      state,
      template: claimAirdropTemplate,
      templatingEngine: "handlebars"
    });
    const claimAirdropContent = await generateObjectDeprecated11({
      runtime,
      context: claimAirdropContext,
      modelClass: ModelClass11.SMALL
    });
    try {
      const claimAirdropData = claimAirdropParamsSchema.parse(claimAirdropContent);
      console.log(
        `Extracted data: ${JSON.stringify(claimAirdropData, null, 2)}`
      );
      const accountId = runtime.getSetting("HEDERA_ACCOUNT_ID");
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new ClaimAirdropService(hederaProvider);
      const response = await action.execute(claimAirdropData, accountId);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Successfully claimed airdrop for token ${claimAirdropData.tokenId}.
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during claiming airdrop:", error);
      if (callback) {
        await callback({
          text: `Error during claiming airdrop: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Claim airdrop (1) 5 Tokens ({{0.0.5445766}}) from {{0.0.5393076}}",
          action: "HEDERA_CLAIM_AIRDROP"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_CLAIM_AIRDROP"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Claim airdrop (2) 50 Tokens ({{0.0.5447843}}) from {{0.0.5393076}}",
          action: "HEDERA_CLAIM_AIRDROP"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_CLAIM_AIRDROP"
        }
      }
    ]
  ],
  similes: ["CLAIM_AIRDROP", "CLAIM_TOKEN_AIRDROP", "CLAIM_TOKEN"]
};

// src/actions/transfer-token/transfer-token.ts
import {
  composeContext as composeContext12,
  generateObjectDeprecated as generateObjectDeprecated12,
  ModelClass as ModelClass12
} from "@elizaos/core";

// src/actions/transfer-token/services/transfer-token.ts
import { TokenId as TokenId5 } from "@hashgraph/sdk";
import { toBaseUnit as toBaseUnit3 } from "hedera-agent-kit/dist/utils/hts-format-utils";
var TransferTokenService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    if (!params.tokenId) {
      throw new Error("Missing tokenId");
    }
    if (!params.toAccountId) {
      throw new Error("Missing recipient accountId");
    }
    if (!params.amount) {
      throw new Error("Missing amount of token");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const tokenId = TokenId5.fromString(params.tokenId);
    return agentKit.transferToken(
      tokenId,
      params.toAccountId,
      await toBaseUnit3(params.tokenId, params.amount, networkType).then(
        (a) => a.toNumber()
      )
    );
  }
};

// src/actions/transfer-token/schema.ts
import { z as z13 } from "zod";
var transferTokenParamsSchema = z13.object({
  tokenId: z13.string(),
  toAccountId: z13.string(),
  amount: z13.coerce.number()
});

// src/actions/transfer-token/transfer-token.ts
var transferTokenAction = {
  name: "TRANSFER_TOKEN",
  description: "Transfer token using provided tokenId between addresses on the same chain",
  handler: async (runtime, message, state, _options, callback) => {
    try {
      const hederaTokenTransferContext = composeContext12({
        state,
        template: hederaTransferTokenTemplate,
        templatingEngine: "handlebars"
      });
      const hederaTokenTransferContent = await generateObjectDeprecated12({
        runtime,
        context: hederaTokenTransferContext,
        modelClass: ModelClass12.SMALL
      });
      const hederaTokenTransferData = transferTokenParamsSchema.parse(
        hederaTokenTransferContent
      );
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new TransferTokenService(hederaProvider);
      const response = await action.execute(
        hederaTokenTransferData,
        networkType
      );
      if (callback && response.status === "SUCCESS") {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Transfer of token ${hederaTokenTransferData.tokenId} to ${hederaTokenTransferData.toAccountId} completed.
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during token transfer:", error);
      await callback({
        text: `Error during token transfer: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "assistant",
        content: {
          text: "I'll help you transfer 3.10 tokens 0.0.5425085 to 0.0.4515512",
          action: "TRANSFER_TOKEN"
        }
      },
      {
        user: "user",
        content: {
          text: "Make transfer 3.10 of tokens 0.0.5425085 to account 0.0.4515512",
          action: "TRANSFER_TOKEN"
        }
      }
    ]
  ],
  similes: ["SEND_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS"]
};

// src/actions/create-topic/create-topic.ts
import {
  composeContext as composeContext13,
  generateObjectDeprecated as generateObjectDeprecated13,
  ModelClass as ModelClass13
} from "@elizaos/core";

// src/actions/create-topic/schema.ts
import { z as z14 } from "zod";
var createTopicParamsSchema = z14.object({
  memo: z14.string(),
  isSubmitKey: z14.coerce.boolean()
});

// src/actions/create-topic/services/create-topic.ts
var CreateTopicService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    if (!params.memo) {
      throw new Error("Missing memo of new topic");
    }
    if (params.isSubmitKey === null) {
      params.isSubmitKey = false;
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return agentKit.createTopic(params.memo, params.isSubmitKey);
  }
};

// src/actions/create-topic/create-topic.ts
var createTopicAction = {
  name: "HEDERA_CREATE_TOPIC",
  description: "Create topic with hedera consensus service for messaging.",
  handler: async (runtime, _message, state, _options, callback) => {
    try {
      const createTopicContext = composeContext13({
        state,
        template: hederaCreateTopicTemplate,
        templatingEngine: "handlebars"
      });
      const createTopicContent = await generateObjectDeprecated13({
        runtime,
        context: createTopicContext,
        modelClass: ModelClass13.SMALL
      });
      console.log(
        `Extracted data: ${JSON.stringify(createTopicContent, null, 2)}`
      );
      const createTopicData = createTopicParamsSchema.parse(createTopicContent);
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new CreateTopicService(hederaProvider);
      const response = await action.execute(createTopicData);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Successfully created topic: ${response.topicId}.
Transaction link: ${url}
`,
          content: {
            success: true,
            topicId: response.topicId
          }
        });
      }
      return true;
    } catch (error) {
      console.error("Error during topic creation:", error);
      await callback({
        text: `Error during topic creation: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Create a new topic with memo 'blockchain logs'",
          action: "HEDERA_CREATE_TOPIC"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll help you create new with memo: blockchain logs",
          action: "HEDERA_CREATE_TOPIC"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Create for me a new topic with memo 'NFT transactions'",
          action: "HEDERA_CREATE_TOPIC"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll help you create new with memo: NFT transactions",
          action: "HEDERA_CREATE_TOPIC"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Create a new topic with memo 'DeFi logs'. Use a submit key.",
          action: "HEDERA_CREATE_TOPIC"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll help you create new with memo: DeFi logs and submit key enabled",
          action: "HEDERA_CREATE_TOPIC"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Create a new topic with memo 'security alerts'. Restrict posting with a key.",
          action: "HEDERA_CREATE_TOPIC"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll help you create new with memo: security alerts and submit key enabled",
          action: "HEDERA_CREATE_TOPIC"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Create a topic with memo 'open discussion'. Let everyone post.",
          action: "HEDERA_CREATE_TOPIC"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll help you create new with memo: open discussion",
          action: "HEDERA_CREATE_TOPIC"
        }
      }
    ]
  ],
  similes: ["CREATE_TOPIC", "NEW_TOPIC", "HEDERA_NEW_TOPIC"]
};

// src/actions/delete-topic/delete-topic.ts
import {
  composeContext as composeContext14,
  generateObjectDeprecated as generateObjectDeprecated14,
  ModelClass as ModelClass14
} from "@elizaos/core";

// src/actions/delete-topic/schema.ts
import { z as z15 } from "zod";
var deleteTopicParamsSchema = z15.object({
  topicId: z15.string()
});

// src/actions/delete-topic/services/delete-topic.ts
import { TopicId } from "@hashgraph/sdk";
var DeleteTopicService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    if (!params.topicId) {
      throw new Error("Missing topicId");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const topicId = TopicId.fromString(params.topicId);
    return agentKit.deleteTopic(topicId);
  }
};

// src/actions/delete-topic/delete-topic.ts
var deleteTopicAction = {
  name: "HEDERA_DELETE_TOPIC",
  description: "Delete topic with hedera consensus service.",
  handler: async (runtime, _message, state, _options, callback) => {
    try {
      const deleteTopicContext = composeContext14({
        state,
        template: hederaDeleteTopicTemplate,
        templatingEngine: "handlebars"
      });
      const deleteTopicContent = await generateObjectDeprecated14({
        runtime,
        context: deleteTopicContext,
        modelClass: ModelClass14.SMALL
      });
      const deleteTopicData = deleteTopicParamsSchema.parse(deleteTopicContent);
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new DeleteTopicService(hederaProvider);
      const response = await action.execute(deleteTopicData);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Successfully deleted topic ${deleteTopicData.topicId}.
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during topic deletion:", error);
      await callback({
        text: `Error during topic deletion: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "assistant",
        content: {
          text: "I'll help you delete topic: {{0.0.5464449}}",
          action: "HEDERA_DELETE_TOPIC"
        }
      },
      {
        user: "user",
        content: {
          text: "Delete topic with id {{0.0.5464449}}",
          action: "HEDERA_DELETE_TOPIC"
        }
      }
    ],
    [
      {
        user: "assistant",
        content: {
          text: "I'll help you delete topic: {{0.0.5464185}}",
          action: "HEDERA_DELETE_TOPIC"
        }
      },
      {
        user: "user",
        content: {
          text: "Delete topic with id {{0.0.5464185}}",
          action: "HEDERA_DELETE_TOPIC"
        }
      }
    ]
  ],
  similes: ["DELETE_TOPIC", "REMOVE_TOPIC", "HEDERA_REMOVE_TOPIC"]
};

// src/actions/dissociate-token/dissociate-token.ts
import {
  composeContext as composeContext15,
  generateObjectDeprecated as generateObjectDeprecated15,
  ModelClass as ModelClass15
} from "@elizaos/core";

// src/actions/dissociate-token/service/dissociate-token-action-service.ts
import { TokenId as TokenId6 } from "@hashgraph/sdk";
var DissociateTokenActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    if (!params.tokenId) {
      throw new Error("No token id");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return await agentKit.dissociateToken(
      TokenId6.fromString(params.tokenId)
    );
  }
};

// src/actions/dissociate-token/schema.ts
import { z as z16 } from "zod";
var hederaDissociateTokenParamsSchema = z16.object({
  tokenId: z16.string()
});

// src/actions/dissociate-token/dissociate-token.ts
var dissociateTokenAction = {
  name: "HEDERA_DISSOCIATE_TOKEN",
  description: "Dissociates provided token with given account",
  handler: async (runtime, _message, state, _options, _callback) => {
    const hederaDissociateTokenContext = composeContext15({
      state,
      template: dissociateTokenTemplate,
      templatingEngine: "handlebars"
    });
    const hederaDissociateTokenContent = await generateObjectDeprecated15({
      runtime,
      context: hederaDissociateTokenContext,
      modelClass: ModelClass15.SMALL
    });
    const paramOptions = {
      tokenId: hederaDissociateTokenContent.tokenId
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaDissociateTokenParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        throw new Error(
          `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new DissociateTokenActionService(hederaProvider);
      const response = await action.execute(paramOptions);
      if (_callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await _callback({
          text: `Token ${paramOptions.tokenId} has been dissociated from account.
Transaction link: ${url}`,
          content: {
            success: true,
            tokenId: paramOptions.tokenId
          }
        });
      }
      return true;
    } catch (error) {
      console.error(
        `Error during dissociating token ${paramOptions.tokenId}:`,
        error
      );
      if (_callback) {
        await _callback({
          text: `Error during dissociating token ${paramOptions.tokenId}: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: dissociateTokenTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Disassociate my wallet from token {{0.0.123456}}.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN",
          tokenId: "0.0.123456"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you unlink my wallet from token {{0.0.654321}}?",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I want to remove my wallet\u2019s association with token {{0.0.987654}}.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Please remove my account\u2019s link to token {{0.0.111222}}.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Disconnect my wallet from token {{0.0.333444}}.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Could you remove token {{0.0.555666}} from my wallet?",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Detach token {{0.0.777888}} from my wallet.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Make my wallet no longer associated with token {{0.0.999000}}.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I\u2019d like to unlink token {{0.0.112233}} from my wallet.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Help me disassociate token {{0.0.445566}} from my wallet.",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_DISSOCIATE_TOKEN"
        }
      }
    ]
  ],
  similes: ["HEDERA_DISSOCIATE_HTS", "HEDERA_UNLINK_TOKEN"]
};

// src/actions/topic-info/topic-info.ts
import {
  composeContext as composeContext16,
  generateObjectDeprecated as generateObjectDeprecated16,
  ModelClass as ModelClass16
} from "@elizaos/core";

// src/actions/topic-info/services/topic-info-action-service.ts
import { TopicId as TopicId2 } from "@hashgraph/sdk";
var TopicInfoActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    if (!params.topicId) {
      throw new Error("No token id provided!");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const topicInfo = await agentKit.getTopicInfo(
      TopicId2.fromString(params.topicId),
      networkType
    );
    const adminKey = topicInfo?.admin_key?.key ? `${topicInfo.admin_key.key}
   type: ${topicInfo.admin_key._type}` : `not available`;
    const submitKey = topicInfo?.submit_key?.key ? `${topicInfo.submit_key.key}
   type: ${topicInfo.submit_key._type}` : `not available`;
    const creationTimeUtc = convertTimestampToUTC(
      topicInfo.created_timestamp
    );
    const expirationTimeUtc = topicInfo?.timestamp?.to ? convertTimestampToUTC(topicInfo.timestamp.to) : "null";
    const memo = topicInfo?.memo ? topicInfo.memo : `not available`;
    return [
      "--------------------------------------",
      `Memo: ${memo}`,
      `Creation time: ${creationTimeUtc}`,
      `Expiration time: ${expirationTimeUtc}`,
      "Admin key:",
      `   ${adminKey}`,
      "Submit key:",
      `   ${submitKey}`,
      `Deleted: ${topicInfo.deleted}`,
      "--------------------------------------"
    ].join("\n");
  }
};

// src/actions/topic-info/schema.ts
import { z as z17 } from "zod";
var hederaTopicInfoParamsSchema = z17.object({
  topicId: z17.string()
});

// src/actions/topic-info/topic-info.ts
var topicInfoAction = {
  name: "HEDERA_TOPIC_INFO",
  description: "Returns details of given topic by its topic ID",
  handler: async (runtime, _message, state, _options, callback) => {
    const hederaTopicInfoContext = composeContext16({
      state,
      template: topicInfoTemplate,
      templatingEngine: "handlebars"
    });
    const hederaTopicInfoContent = await generateObjectDeprecated16({
      runtime,
      context: hederaTopicInfoContext,
      modelClass: ModelClass16.SMALL
    });
    const paramOptions = {
      topicId: hederaTopicInfoContent.topicId
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaTopicInfoParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(
          (e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`
        );
        throw new Error(
          `Error during fetching topic info: ${errorMessages.join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new TopicInfoActionService(hederaProvider);
      const result = await action.execute(paramOptions, networkType);
      if (callback && result !== "") {
        const url = `https://hashscan.io/${networkType}/topic/${paramOptions.topicId}`;
        await callback({
          text: `Topic info for topic with id ${paramOptions.topicId}:
${result}
Link: ${url}`,
          content: {
            success: true,
            topicInfo: result
          }
        });
      }
      return true;
    } catch (error) {
      console.error("Error during fetching topic info: ", error);
      if (callback) {
        await callback({
          text: `Error during fetching topic info: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: topicInfoTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Give me the info for topic {{0.0.12345}}.",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Give me the details about topic {{0.0.12345}}.",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I'd like to see the status of topic {{0.0.67890}}.",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Fetch topic details for {{0.0.112233}}.",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "What can you tell me about topic {{0.0.445566}}?",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Retrieve details of topic {{0.0.778899}}.",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you provide information on topic {{0.0.556677}}?",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: {
          text: "I'd like to get details on topic {{0.0.998877}}.",
          action: "HEDERA_TOPIC_INFO"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "",
          action: "HEDERA_TOPIC_INFO"
        }
      }
    ]
  ],
  similes: [
    "HCS_TOPIC_INFO",
    "HEDERA_HCS_INFO",
    "HEDERA_TOPIC_DETAILS",
    "HCS_TOPIC_DETAILS"
  ]
};

// src/actions/submit-topic-message/submit-topic-message.ts
import {
  composeContext as composeContext17,
  generateObjectDeprecated as generateObjectDeprecated17,
  ModelClass as ModelClass17
} from "@elizaos/core";

// src/actions/submit-topic-message/services/submit-topic-message-action-service.ts
import { TopicId as TopicId3 } from "@hashgraph/sdk";
var SubmitTopicMessageActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return agentKit.submitTopicMessage(
      TopicId3.fromString(params.topicId),
      params.message
    );
  }
};

// src/actions/submit-topic-message/schema.ts
import { z as z18 } from "zod";
var hederaSubmitTopicMessageParamsSchema = z18.object({
  topicId: z18.string(),
  message: z18.string()
});

// src/actions/submit-topic-message/submit-topic-message.ts
var submitTopicMessageAction = {
  name: "HEDERA_SUBMIT_TOPIC_MESSAGE",
  description: "Submits message to a topic given by its id",
  handler: async (runtime, _message, state, _options, callback) => {
    const hederaSubmitTopicMessageContext = composeContext17({
      state,
      template: submitTopicMessageTemplate,
      templatingEngine: "handlebars"
    });
    const hederaSubmitTopicMessageContent = await generateObjectDeprecated17({
      runtime,
      context: hederaSubmitTopicMessageContext,
      modelClass: ModelClass17.SMALL
    });
    const paramOptions = {
      topicId: hederaSubmitTopicMessageContent.topicId,
      message: hederaSubmitTopicMessageContent.message
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaSubmitTopicMessageParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(
          (e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`
        );
        throw new Error(
          `Error during parsing data from users prompt: ${errorMessages.join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new SubmitTopicMessageActionService(hederaProvider);
      const response = await action.execute(paramOptions);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Successfully submitted message to topic: ${paramOptions.topicId}
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error(
        "Error during submitting message. You might not have the submitting privileges for this topic. Error:",
        error
      );
      if (callback) {
        await callback({
          text: `Error during submitting message. You might not have the submitting privileges for this topic. Error: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: submitTopicMessageTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Submit message: 'hello world' to topic 0.0.123456.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll submit 'hello world' to topic 0.0.123456.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Submit message 'Hedera is great!' to topic 0.0.654321.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll submit 'Hedera is great!' to topic 0.0.654321.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "I want to post to topic 0.0.987654. Message: Smart contracts update.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll submit 'Smart contracts update' to topic 0.0.987654.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Send 'DeFi price feed update' to topic 0.0.456789.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll submit 'DeFi price feed update' to topic 0.0.456789.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Post 'Security alert: suspicious activity' to topic 0.0.112233.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      },
      {
        user: "assistant",
        content: {
          text: "I'll submit 'Security alert: suspicious activity' to topic 0.0.112233.",
          action: "HEDERA_SUBMIT_TOPIC_MESSAGE"
        }
      }
    ]
  ],
  similes: ["HEDERA_NEW_MESSAGE", "HCS_MESSAGE", "HCS_TOPIC_SUBMIT_MESSAGE"]
};

// src/actions/get-topic-messages/get-topic-messages.ts
import {
  composeContext as composeContext18,
  generateObjectDeprecated as generateObjectDeprecated18,
  ModelClass as ModelClass18
} from "@elizaos/core";

// src/actions/get-topic-messages/schema.ts
import { z as z19 } from "zod";
var hederaGetTopicMessagesParamsSchema = z19.object({
  topicId: z19.string(),
  lowerThreshold: z19.string().nullable(),
  upperThreshold: z19.string().nullable()
});

// src/actions/get-topic-messages/services/get-topic-messages-action-service.ts
import { TopicId as TopicId4 } from "@hashgraph/sdk";
var GetTopicMessageActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const result = await agentKit.getTopicMessages(
      TopicId4.fromString(params.topicId),
      networkType,
      convertStringToTimestamp(params.lowerThreshold),
      convertStringToTimestamp(params.upperThreshold)
    );
    return {
      status: "SUCCESS" /* SUCCESS */,
      messages: result
    };
  }
};

// src/actions/get-topic-messages/get-topic-messages.ts
var getTopicMessagesAction = {
  name: "HEDERA_GET_TOPIC_MESSAGES",
  description: "Action for fetching messages from a topic by its ID, with the option to filter messages by upper and lower thresholds.",
  handler: async (runtime, _message, state, _options, callback) => {
    const hederaGetTopicMessagesContext = composeContext18({
      state,
      template: getTopicMessagesTemplate,
      templatingEngine: "handlebars"
    });
    const hederaGetTopicMessagesContent = await generateObjectDeprecated18({
      runtime,
      context: hederaGetTopicMessagesContext,
      modelClass: ModelClass18.SMALL
    });
    const paramOptions = {
      topicId: hederaGetTopicMessagesContent.topicId,
      lowerThreshold: hederaGetTopicMessagesContent.lowerThreshold,
      upperThreshold: hederaGetTopicMessagesContent.upperThreshold
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaGetTopicMessagesParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(
          (e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`
        );
        throw new Error(
          `Error during parsing data from users prompt: ${errorMessages.join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new GetTopicMessageActionService(hederaProvider);
      const response = await action.execute(paramOptions, networkType);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        let formatedText = "";
        response.messages.forEach((hcsMessage) => {
          formatedText += `-----------------------
Author: ${hcsMessage.payer_account_id}
Body: ${hcsMessage.message}
Timestamp: ${convertTimestampToUTC(hcsMessage.consensus_timestamp)}
`;
        });
        const dateRangeText = `between ${paramOptions.lowerThreshold ? paramOptions.lowerThreshold : "topic creation"} and ${paramOptions.upperThreshold ? paramOptions.upperThreshold : "this moment"}`;
        await callback({
          text: `Messages for topic ${paramOptions.topicId} posted ${dateRangeText}:
${formatedText}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error fetching messages. Error:", error);
      if (callback) {
        await callback({
          text: `Error fetching messages. Error: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: getTopicMessagesTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Get messages from a topic {{0.0.123456}}.",
          action: "HEDERA_GET_TOPIC_MESSAGES"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_GET_TOPIC_MESSAGES"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Show me all messages from a topic {{0.0.123456}}, that have been posted since {{05.02.2025 14:14:14:144}}.",
          action: "HEDERA_GET_TOPIC_MESSAGES"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_GET_TOPIC_MESSAGES"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Show me all messages from a topic {{0.0.123456}}, that have been posted between {{05.02.2025 14:14:14:144}} and {{08.02.2025 20:14:20:144}}.",
          action: "HEDERA_GET_TOPIC_MESSAGES"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_GET_TOPIC_MESSAGES"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_GET_TOPIC_MESSAGES",
    "HEDERA_GET_HCS_MESSAGES",
    "HCS_FETCH_MESSAGES"
  ]
};

// src/actions/mint-token/mint-token.ts
import {
  composeContext as composeContext19,
  generateObjectDeprecated as generateObjectDeprecated19,
  ModelClass as ModelClass19
} from "@elizaos/core";

// src/actions/mint-token/services/mint-token-action-service.ts
import { TokenId as TokenId7 } from "@hashgraph/sdk";
import { toBaseUnit as toBaseUnit4 } from "hedera-agent-kit/dist/utils/hts-format-utils";
var MintTokenActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const baseUnitAmount = await toBaseUnit4(
      params.tokenId,
      params.amount,
      networkType
    );
    return agentKit.mintToken(
      TokenId7.fromString(params.tokenId),
      baseUnitAmount.toNumber()
    );
  }
};

// src/actions/mint-token/schema.ts
import { z as z20 } from "zod";
var hederaMintTokenParamsSchema = z20.object({
  tokenId: z20.string(),
  amount: z20.coerce.number()
});

// src/actions/mint-token/mint-token.ts
var mintTokenAction = {
  name: "HEDERA_MINT_TOKEN",
  description: "Action allowing minting fungible tokens",
  handler: async (runtime, _message, state, _options, callback) => {
    const hederaMintTokenContext = composeContext19({
      state,
      template: mintTokenTemplate,
      templatingEngine: "handlebars"
    });
    const hederaMintTokenContent = await generateObjectDeprecated19({
      runtime,
      context: hederaMintTokenContext,
      modelClass: ModelClass19.SMALL
    });
    const paramOptions = {
      tokenId: hederaMintTokenContent.tokenId,
      amount: hederaMintTokenContent.amount
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaMintTokenParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(
          (e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`
        );
        throw new Error(
          `Error during parsing data from users prompt: ${errorMessages.join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new MintTokenActionService(hederaProvider);
      const response = await action.execute(
        paramOptions,
        networkType
      );
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Successfully minted ${paramOptions.amount} of tokens ${paramOptions.tokenId}
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during minting tokens. Error:", error);
      if (callback) {
        await callback({
          text: `Error during minting tokens. Error: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: mintTokenTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Mint 2500 tokens 0.0.999888",
          action: "HEDERA_MINT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_TOKEN"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Generate 150 tokens 0.0.567123",
          action: "HEDERA_MINT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_TOKEN"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Create and distribute 4000 tokens with id 0.0.333222",
          action: "HEDERA_MINT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_TOKEN"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Mint exactly 999 tokens 0.0.741852",
          action: "HEDERA_MINT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_TOKEN"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "HEDERA_MINT_TOKEN: Issue 5000 tokens 0.0.852963",
          action: "HEDERA_MINT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_TOKEN"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_MINT_TOKEN_ACTION",
    "HEDERA_MINT_FUNGIBLE_TOKEN",
    "HCS_MINT_TOKEN"
  ]
};

// src/actions/set-spending-approval/set-spending-approval.ts
import {
  composeContext as composeContext20,
  generateObjectDeprecated as generateObjectDeprecated20,
  ModelClass as ModelClass20
} from "@elizaos/core";

// src/actions/set-spending-approval/schema.ts
import { z as z21 } from "zod";
var hederaSetSpendingApprovalParamsSchema = z21.object({
  spenderAccountId: z21.string(),
  amount: z21.coerce.number(),
  tokenId: z21.string().nullable().optional()
});

// src/actions/set-spending-approval/services/set-spending-approval-action-service.ts
import { AccountId as AccountId2, TokenId as TokenId8 } from "@hashgraph/sdk";
import { toBaseUnit as toBaseUnit5 } from "hedera-agent-kit/dist/utils/hts-format-utils";
var SetSpendingApprovalTokenAction = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params, networkType) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    let parsedAmount = params.amount;
    if (params.tokenId) {
      parsedAmount = await toBaseUnit5(params.tokenId, params.amount, networkType).then(
        (a) => a.toNumber()
      );
    }
    const parsedTokenId = params.tokenId ? TokenId8.fromString(params.tokenId) : void 0;
    return await agentKit.approveAssetAllowance(
      AccountId2.fromString(params.spenderAccountId),
      parsedAmount,
      parsedTokenId
    );
  }
};

// src/actions/set-spending-approval/set-spending-approval.ts
var setSpendingApprovalAction = {
  name: "HEDERA_SET_SPENDING_APPROVAL",
  description: "Action for setting spending approval for HBAR or fungible tokens",
  handler: async (runtime, _message, state, _options, callback) => {
    const hederaGetTopicMessagesContext = composeContext20({
      state,
      template: getSpendingAllowanceTemplate,
      templatingEngine: "handlebars"
    });
    const hederaSetSpedingApprovalContent = await generateObjectDeprecated20({
      runtime,
      context: hederaGetTopicMessagesContext,
      modelClass: ModelClass20.SMALL
    });
    const paramOptions = {
      spenderAccountId: hederaSetSpedingApprovalContent.spenderAccountId,
      amount: hederaSetSpedingApprovalContent.amount,
      tokenId: hederaSetSpedingApprovalContent.tokenId
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaSetSpendingApprovalParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(
          (e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`
        );
        throw new Error(
          `Error during parsing data from users prompt: ${errorMessages.join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new SetSpendingApprovalTokenAction(hederaProvider);
      const response = await action.execute(paramOptions, networkType);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        const token = paramOptions.tokenId ? paramOptions.tokenId : "HBAR";
        await callback({
          text: `Successfully set the spending approval of ${paramOptions.amount} of tokens ${token} for the account ${paramOptions.spenderAccountId}.
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error setting the spending approval. Error:", error);
      if (callback) {
        await callback({
          text: `Error setting the spending approval. Error: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: getTopicMessagesTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Set spending approval for an account {{0.0.123456}} for 123 HBAR.",
          action: "HEDERA_SET_SPENDING_APPROVAL"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_SET_SPENDING_APPROVAL"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Set spending approval for an account {{0.0.123456}} for 123 tokens {{0.0.2222222}}.",
          action: "HEDERA_SET_SPENDING_APPROVAL"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_SET_SPENDING_APPROVAL"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Set spending approval of 123 tokens {{0.0.2222222}} for an account {{0.0.123456}}.",
          action: "HEDERA_SET_SPENDING_APPROVAL"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_SET_SPENDING_APPROVAL"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_SET_SPENDING_APPROVAL_HBAR",
    "HEDERA_SET_SPENDING_APPROVAL_HTS"
  ]
};

// src/actions/create-nft-token/create-nft-token.ts
import {
  composeContext as composeContext21,
  generateObjectDeprecated as generateObjectDeprecated21,
  ModelClass as ModelClass21
} from "@elizaos/core";

// src/actions/create-nft-token/services/create-nft-action-service.ts
var CreateNftActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    if (!params.name) {
      throw new Error("Missing name of token");
    }
    if (!params.symbol) {
      throw new Error("Missing symbol of token");
    }
    const agentKit = this.hederaProvider.getHederaAgentKit();
    const options = {
      name: params.name,
      symbol: params.symbol,
      maxSupply: params.maxSupply,
      // NFT tokens always have decimals 0 so no parsing to base unit is needed
      isMetadataKey: params.isMetadataKey,
      isAdminKey: params.isMetadataKey,
      tokenMetadata: new TextEncoder().encode(params.tokenMetadata),
      memo: params.memo
    };
    return agentKit.createNFT(
      options
    );
  }
};

// src/actions/create-nft-token/schema.ts
import { z as z22 } from "zod";
var createNFTTokenParamsSchema = z22.object({
  name: z22.string(),
  symbol: z22.string(),
  maxSupply: z22.union([z22.string(), z22.number()]).optional().nullable().transform(castToNull).transform((value) => {
    if (value === null) {
      return null;
    }
    return Number(value);
  }),
  isMetadataKey: castToBoolean,
  isAdminKey: castToBoolean,
  tokenMetadata: z22.string().optional().nullable().transform(castToNull),
  memo: z22.string().optional().nullable().transform(castToNull)
});

// src/actions/create-nft-token/utils.ts
var createNFTDetailsDescription = (params) => {
  const name = `Name: ${params.name}`;
  const symbol = `Symbol: ${params.symbol}`;
  const maxSupply = `Max Supply: ${params.maxSupply ? params.maxSupply : `not set`}`;
  const isMetadataKey = `Metadata Key: ${params.isMetadataKey === void 0 || !params.isMetadataKey ? "not set" : "Enabled"}`;
  const isAdminKey = `Admin Key: ${params.isAdminKey === void 0 || !params.isAdminKey ? "not set" : "Enabled"}`;
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

// src/actions/create-nft-token/create-nft-token.ts
var createNFTTokenAction = {
  name: "HEDERA_CREATE_NFT_TOKEN",
  description: "Create a new non-fungible token (NFT) on the Hedera network",
  handler: async (runtime, _message, state, _options, callback) => {
    try {
      const hederaCreateNFTTokenContext = composeContext21({
        state,
        template: hederaCreateNFTTokenTemplate,
        templatingEngine: "handlebars"
      });
      const hederaCreateNFTTokenContent = await generateObjectDeprecated21({
        runtime,
        context: hederaCreateNFTTokenContext,
        modelClass: ModelClass21.SMALL
      });
      console.log(
        `Extracted data: ${JSON.stringify(hederaCreateNFTTokenContent, null, 2)}`
      );
      const createTokenData = createNFTTokenParamsSchema.parse(
        hederaCreateNFTTokenContent
      );
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const createTokenService = new CreateNftActionService(hederaProvider);
      const response = await createTokenService.execute(createTokenData);
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Created new NFT token with id: ${response.tokenId.toString()}

Details:${createNFTDetailsDescription(createTokenData)}

Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during token creation:", error);
      await callback({
        text: `Error during token creation: ${error.message}`,
        content: { error: error.message }
      });
      return false;
    }
  },
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "{{user}}",
        content: {
          text: "Create a new NFT token called {{MyNFT}} with symbol {{NFT}}, and a maximum supply of {{100}}. Add metadata: 'This is a test NFT token' and memo 'memo for NFT'.",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Create an NFT token named {{UniqueArt}} with symbol {{ART}} and a maximum supply of {{50}}. Set the metadata key to true and provide a memo: 'Unique art of the future' for it.",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Deploy an NFT token called {{GamingItem}} with symbol {{GI}} and a maximum supply of {{1000}}. I want to set the admin key to manage the token later.",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Launch a new NFT token named {{ArtCollectible}} with symbol {{ARTC}} and a maximum supply of {{10}}. Set the metadata and admin keys. Do not set the memo or metadata.",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Create a new NFT token called {{ExclusiveItem}} with symbol {{EI}} and a maximum supply of {{5}}. This token will have a metadata key, and no admin key or memo.",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Create an NFT token named {{LimitedEditionNFT}} with the symbol {{LENFT}} and a maximum supply of {{100}}. No admin or metadata key, and no memo required.",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "{{user}}",
        content: {
          text: "Create a new NFT token called {{ArtPiece}} with symbol {{AP}}, a maximum supply of {{20}}, and add a memo for the launch.",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      },
      {
        user: "{{assistant}}",
        content: {
          text: "",
          action: "HEDERA_CREATE_NFT_TOKEN"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_NEW_TOKEN",
    "HEDERA_CREATE_NEW_TOKEN",
    "HEDERA_NEW_FUNGIBLE_TOKEN"
  ]
};

// src/actions/mint-nft-token/mint-token.ts
import {
  composeContext as composeContext22,
  generateObjectDeprecated as generateObjectDeprecated22,
  ModelClass as ModelClass22
} from "@elizaos/core";

// src/actions/mint-nft-token/services/mint-nft-action-service.ts
import { TokenId as TokenId9 } from "@hashgraph/sdk";
var MintNftActionService = class {
  constructor(hederaProvider) {
    this.hederaProvider = hederaProvider;
    this.hederaProvider = hederaProvider;
  }
  async execute(params) {
    const agentKit = this.hederaProvider.getHederaAgentKit();
    return agentKit.mintNFTToken(
      TokenId9.fromString(params.tokenId),
      new TextEncoder().encode(params.tokenMetadata)
    );
  }
};

// src/actions/mint-nft-token/schema.ts
import { z as z23 } from "zod";
var hederaMintNFTTokenParamsSchema = z23.object({
  tokenId: z23.string(),
  tokenMetadata: z23.string()
});

// src/actions/mint-nft-token/mint-token.ts
var mintNFTTokenAction = {
  name: "HEDERA_MINT_NFT_TOKEN",
  description: "Action allowing minting non-fungible (NFT) tokens",
  handler: async (runtime, _message, state, _options, callback) => {
    const hederaMintNFTTokenContext = composeContext22({
      state,
      template: mintNFTTokenTemplate,
      templatingEngine: "handlebars"
    });
    const hederaMintNFTTokenContent = await generateObjectDeprecated22({
      runtime,
      context: hederaMintNFTTokenContext,
      modelClass: ModelClass22.SMALL
    });
    const paramOptions = {
      tokenId: hederaMintNFTTokenContent.tokenId,
      tokenMetadata: hederaMintNFTTokenContent.tokenMetadata
    };
    console.log(
      `Extracted data: ${JSON.stringify(paramOptions, null, 2)}`
    );
    try {
      const validationResult = hederaMintNFTTokenParamsSchema.safeParse(paramOptions);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(
          (e) => `Field "${e.path.join(".")}" failed validation: ${e.message}`
        );
        throw new Error(
          `Error during parsing data from users prompt: ${errorMessages.join(", ")}`
        );
      }
      const hederaProvider = new HederaProvider(runtime);
      const networkType = runtime.getSetting(
        "HEDERA_NETWORK_TYPE"
      );
      const action = new MintNftActionService(hederaProvider);
      const response = await action.execute(
        paramOptions
      );
      if (callback && response.status === "SUCCESS" /* SUCCESS */) {
        const url = generateHashscanUrl(response.txHash, networkType);
        await callback({
          text: `Successfully minted NFT ${paramOptions.tokenId}
Transaction link: ${url}`
        });
      }
      return true;
    } catch (error) {
      console.error("Error during minting NFT. Error:", error);
      if (callback) {
        await callback({
          text: `Error during minting NFT. Error: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },
  template: mintTokenTemplate,
  validate: async (runtime) => {
    const privateKey = runtime.getSetting("HEDERA_PRIVATE_KEY");
    const accountAddress = runtime.getSetting("HEDERA_ACCOUNT_ID");
    const selectedNetworkType = runtime.getSetting("HEDERA_NETWORK_TYPE");
    return !!(privateKey && accountAddress && selectedNetworkType);
  },
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Mint NFT {{0.0.5478757}}. Set it's metadata to '{{https://example.com/nft-image.png}}'.",
          action: "HEDERA_MINT_NFT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Mint NFT with id {{0.0.5478757}}. Assign '{{https://example.com/nft-image.png}}' to its metadata.",
          action: "HEDERA_MINT_NFT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_NFT_TOKEN"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "Mint NFT {{0.0.5512318}} with metadata '{{Testing this nft}}'",
          action: "HEDERA_MINT_NFT_TOKEN"
        }
      },
      {
        user: "assistant",
        content: {
          text: "",
          action: "HEDERA_MINT_NFT_TOKEN"
        }
      }
    ]
  ],
  similes: [
    "HEDERA_MINT_NFT_TOKEN_ACTION",
    "HEDERA_MINT_NON_FUNGIBLE_TOKEN",
    "HCS_MINT_NFT"
  ]
};

// src/index.ts
var hederaPlugin = {
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
  ]
};
var index_default = hederaPlugin;
export {
  index_default as default,
  hederaPlugin
};
//# sourceMappingURL=index.js.map