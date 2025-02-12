export const hederaHBARTransferTemplate = `Given the recent messages and hedera wallet information below:
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

export const hederaCreateTokenTemplate = `Given the recent messages and hedera wallet information below:
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

Always try to extract the information from last message! Do not use previously completed requests data to fill extracted information!
Respond with a JSON markdown block containing only the extracted values. All fields except 'token' are required:
\`\`\`json
{
    "name": string,
    "symbol": string,
    "decimals": number,
    "initialSupply": number,
    "isSupplyKey": boolean,
}
\`\`\`

Example response for the input: "Create new token with name MyToken with symbol MTK, 8 decimals and 1000 initial supply", the response should be:
\`\`\`json
{
    "name": "MyToken",
    "symbol": "MTK",
    "decimals": 8,
    "initialSupply": 1000,
    "isSupplyKey": false,
}
\`\`\`

Example response for the input: "Create new token with name NextToken with symbol NXT, 5 decimals and 1000 initial supply. I want to set the supply key so I could more tokens later.", the response should be:
\`\`\`json
{
    "name": "NextToken",
    "symbol": "NXT",
    "decimals": 5,
    "initialSupply": 1000,
    "isSupplyKey": true,
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
}
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;

export const hederaAirdropTokenTemplate = `Given the recent messages and hedera wallet information below:
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

Example reponse for the input: "Airdrop 50 tokens 0.0.5425085 for 0.0.5398121, 0.0.5393967, 0.0.5395127", the response should be:
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

export const pendingAirdropTemplate = `Given the recent messages and wallet information below:
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
    - If you cant find accountId return structure with account id equall null.
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

export const claimAirdropTemplate = `Given the recent messages and wallet information below:
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

export const hederaTransferTokenTemplate = `Given the recent messages and hedera wallet information below:
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

Example reponse for the input: "Make transfer 3.10 of tokens 0.0.5425085 to account 0.0.4515512", the response should be:
\`\`\`json
{
    "tokenId": "0.0.5425085",
    "toAccountId": "0.0.4515512",
    "amount": 3.10
\`\`\`

Now respond with a JSON markdown block containing only the extracted values.
`;

export const hederaCreateTopicTemplate = `Given the recent messages and hedera wallet information below:
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

export const hederaDeleteTopicTemplate = `Given the recent messages and hedera wallet information below:
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

export const balanceHbarTemplate = `Given the recent messages and wallet information below:
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

export const balanceHtsTemplate = `Given the recent messages and wallet information below:
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

export const balancesAllTokensTemplate = `Given the recent messages and wallet information below:
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

export const rejectTokenTemplate = `Given the recent messages and wallet information below:
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

export const associateTokenTemplate = `Given the recent messages and wallet information below:
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

export const dissociateTokenTemplate = `Given the recent messages and wallet information below:
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

export const tokenHoldersTemplate = `Given the recent messages and wallet information below:
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

export const topicInfoTemplate = `Given the recent messages
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

export const submitTopicMessageTemplate = `Given the recent messages and wallet information below:
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

export const getTopicMessagesTemplate = `Given the recent messages and wallet information below:
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

export const mintTokenTemplate = `Given the recent messages and wallet information below:
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
