
# `@elizaos/plugin-hedera`

This plugin provides actions and utilities for interacting with Hedera blockchain.

---

## Development

Prepare Eliza according to [README](https://github.com/elizaOS/eliza/blob/main/README.md).

Add variables required for `@elizaos/plugin-hedera` :

```env
# accepts ED25519 and ECDSA private keys both DER and HEX encoded
HEDERA_PRIVATE_KEY= 

# accepts hedera account id ex. `0.0.5393196`
HEDERA_ACCOUNT_ID=

# accepts 'mainnet', 'testnet' or 'previewnet'
HEDERA_NETWORK_TYPE=

# accepts 'ECDSA' or 'ED25519'
HEDERA_KEY_TYPE= 
```

Ensure the appropriate environment variables are added for the plugin. If they are correctly configured, the project will run with `@elizaos/plugin-hedera`

Run Eliza

``` bash
  pnpm run dev
```

---

### Using the universal helper Character

The plugin includes a pre-configured character, `universalHelper.character.json`, optimized for Hedera blockchain operations. This character enhances interaction by:

- Handling repeated prompts effectively.

- Better extracting data from user prompts and matching them with proper actions.

To use the character, pass it with the `--characters` flag:

```bash
  pnpm run dev --characters='../characters/universalHelper.character.json'
```

---

### Testing
For testing purposes it is recommended to erase agent's memory on the app start.
This helps you achieve clean environment and erases impact of previously called actions and passed prompts which helps to test new changes during development.
To erase agent's memory and run Eliza with recommended character use following script
```bash
  rm ./agent/data/db.sqlite ; pnpm run dev --character ./characters/universalHelper.character.json 
```
---

## Provider
Plugin implements provider creating instance of `HederaAgentKit` from 
`hedera-agent-kit`. `HederaAgentKit` offers API for interacting with Hedera blockchain and supports executing of operations called from actions.

Provider contains method `get()` that is called after each input given by user. It takes care of refreshing amount of HBAR held by connected account and stored in agent's memory - state.

Connected wallet is considered to be the agent's property. Due to that fact for extracting knowledge about connected wallet's HBAR balance use the following prompt:
1. User input
```
What's yours HBAR balance?
```
2. Response from LLM based on stored context:
```
My current HBAR balance is 999.81307987 HBAR.
```

Note that there is no action required for getting agent's HBAR balance.

---

## Actions

### HBAR Balance

HBAR balance action allows checking HBAR balance of any given valid Hedera wallet.
Note that this action takes one mandatory parameter:
- **AccountId** - id of Hedera account (ex. `0.0.4515512`)

#### Example Prompts

Below is presented a flow of using HBAR balance action:

1. User input:

```
Show me HBAR balance of wallet 0.0.5423981
```

2. LLM response - action execution:

```
I'll help you get the HBAR balance of wallet 0.0.5423981. (HEDERA_HBAR_BALANCE)
```

3. Action's callback response:

```
Address 0.0.5423981 has balance of 120.76334864 HBAR
```
Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. `0.0.5423981`).

Examples of other supported requests for this action:
```
Whats HBAR balance of wallet 0.0.5423981
Show me HBAR balance of wallet 0.0.5423949. Call HEDERA_HBAR_BALANCE action
Check HBAR balance of wallet 0.0.4515756
```

---

### HTS Balance

HTS balance action allows checking HTS balance of any given valid Hedera wallet.
Note that this action takes two mandatory parameters:
- **AccountId** - id of Hedera account (ex. `0.0.4515512`)
- **TokenId** - id of HTS token (ex. `0.0.5446064`)

#### Example Prompts

Below is presented a flow of using HTS balance action:

1. User input:

```
Show me balance of token 0.0.5446064 for wallet 0.0.5446063.
```

2. LLM response - action execution:

```
Calling relevant action to retrieve token balance. Please wait...
```

3. Action's callback response:

```
Address 0.0.5446063 has balance of token USD Bar equal 10000000 USDB (token id: 0.0.5446064)
```
Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. `0.0.5423981`).

Examples of other supported requests for this action:
```
Show me balance of token 0.0.5450643 for account account 0.0.5392887
Whats 0.0.5450643 balance for wallet 0.0.5392887
Show me balance of hts token with id 0.0.5450643 for wallet 0.0.5392887.
```

---

### All Tokens Balance

All tokens balance action allows checking all HTS tokens balances of any given valid Hedera wallet. Works with both fungible and non-fungible tokens.
Note that this action takes one optional parameter:
- **AccountId** - id of Hedera account (ex. `0.0.4515512`)

If accountId is not provided, action defaults to agents connected wallet.

#### Example Prompts

Below is presented a flow of using All tokens balance action with wallet address provided.

1. User input:

```
Show me the balances of all HTS tokens for wallet 0.0.5392887
```

2. LLM response - action execution:

```
Calling relevant action to retrieve token balances. Please wait...
```

3. Action's callback response:

```
Address 0.0.5392887 has following token balances:
ExampleToken: 0 EXT
AirDrop Token2: 9990 ADT2
AirDrop Token: 10000 ADT
HIP-904 FT: 0 HIP904FT
Test Token test : 0 HTT
Test Token: 0 HTT
```

Below is presented a flow of using All tokens balance action without wallet address provided.

1. User input:

```
Show me your HTS token balances.
```

2. LLM response - action execution:

```
Calling relevant action to retrieve token balances. Please wait...
```

3. Action's callback response:

```
Address 0.0.5393196 has following token balances:
TokenTokenToken: 0.1 TTT
SkyCredits: 0.000025 SKC
MyToken: 2.1 MTK
CryptoCoin: 0.05 CCN
HederaDollar: 99.676 H$
kolor: 999800 KLR
MyToken: 0.00001 MTK
```

Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. `0.0.5423981`).

Examples of other supported requests for this action:
```
Show me the balances of all HTS tokens for wallet 0.0.4515756
What are the HTS token balances for wallet 0.0.4515756?
Show me your HTS token balances.
```

---

### Token Holders

Token Holders action allows checking all holders of any given valid token - works both with fungible and non-fungible tokens. Token is passed by its token id.
Note that this action takes two parameters:
- **tokenId** - valid token id (ex. `0.0.5446064`) - required parameter
- **threshold** - integer non-negative number, if passed 0 action will return all addresses associated with the token - optional parameter

If threshold is not passed the action will fetch all wallets associated with given token that have with non-zero balances. For example see following section.
#### Example Prompts

Below is presented a flow of using All tokens balance action

##### No threshold passed - only wallets with balances greater then 0
1. User input:

```
Can you show me the token holders for 0.0.5445349
```

2. LLM response - action execution:

```
Calling relevant action to retrieve token holders. Please wait...
```

3. Action's callback response:

```
Token 0.0.5445349 (AirDrop Token2) has following holders:
0.0.5393076: 10 ADT2
0.0.5392887: 9990 ADT2
```

##### Threshold equal 0 passed - all wallets associated with the token
1. User input:

```
Can you show me the token holders for 0.0.5445349 with minimum balance equal 0
```

2. LLM response - action execution:

```
Calling relevant action to retrieve token holders. Please wait...
```

3. Action's callback response:

```
Token 0.0.5445349 (AirDrop Token2) has following holders:
0.0.5393196: 0 ADT2
0.0.5393076: 10 ADT2
0.0.5392887: 9990 ADT2
```

##### Threshold equal 1000 passed - all wallets associated with the token with balances greater or equal 1000
1. User input:

```
Can you show me the token holders for 0.0.5445349 with minimum balance equal 1000
```

2. LLM response - action execution:

```
Calling relevant action to retrieve token holders. Please wait...
```

3. Action's callback response:

```
Token 0.0.5445349 (AirDrop Token2) has following holders:
0.0.5392887: 9990 ADT2
```

Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. `0.0.5423981`).

Examples of other supported requests for this action:
```
Who owns token 0.0.5451966 and what are their balances?
Can you show me the token holders for 0.0.5450181?
Show me the balance of token 0.0.5450181 across all wallets.
Which wallets hold token 0.0.5450181 and have at least 5000 tokens?
Can you provide details of wallets owning token 0.0.5450181 with balances equal or above 2000?
```

---

### Create token

Create token action allows to create a new fungible token on the Hedera network.
Note that this action takes four mandatory parameters:
- **name** - name of the new token to create
- **symbol** - token symbol as uppercase short string
- **decimals** - token decimals as number
- **initialSupply** - initial supply of fungible tokens given in display format
- **isSupplyKey** - boolean deciding whether agent's key should be set as supply key allowing to mint more tokens (optional)
- **isMetadataKey** - boolean deciding whether agent's key should be set as metadata key (optional)
- **isAdminKey** - boolean deciding whether agent's key should be set as admin key (optional)
- **memo** - short text
- **tokenMetadata** - metadata for token

#### Example Prompts

Below is presented a flow of using Create Token action

##### Without optional params:
1. User input:

```
Create token GameGold with symbol GG, 2 decimal places, and starting supply of 750000.
```

2. LLM response - action execution:

```
I will help you create the token 'GameGold' with symbol 'GG', 2 decimal places, and a starting supply of 750,000. This will be the final supply, and no supply key will be set.
```

3. Action's callback response:

```
Created new token with id: 0.0.5478715
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1738841329.271042438
```

##### With supplyKey, adminKey and metadataKey:
_Note:_ Try to be specific about the keys. Data extraction error might occur if full phrase `Add supply key` or `Add admin key` won't appear. 
Also, it is recommended to use approach `Add supply key, admin key and metadata key` instead of `Add supply, admin and metadata keys`.
1. User input:

```
Create token BitcoinIsGold with symbol BIG, 2 decimal places, and starting supply of 12345. Add supply key, admin key and metadata key.
```

2. LLM response - action execution:

```
I will help you create the token 'BitcoinIsGold' with symbol 'BIG', 2 decimal places, and a starting supply of 12,345. A supply key will be added for this token.
```

3. Action's callback response:

```
Created new fungible token with id: 0.0.5526711

Details:
Name: BitcoinIsGold
Symbol: BIG
Decimals: 2
Initial supply: 12345
Supply Key: Enabled
Metadata Key: Enabled
Admin Key: Enabled
Token Metadata: not set
Memo: not set

Transaction link: https://hashscan.io/testnet/tx/0.0.5392887@1739795581.817796574
```

##### With memo and tokenMetadata:
1. User input:

```
Create token GameGold with symbol GG, 2 decimal places, and starting supply of 750000. Set memo to 'This is an example memo' and token metadata to 'And thats an example metadata'.
```

2. LLM response - action execution:

```
I will help you create the token 'GameGold' with symbol 'GG', 2 decimal places, and a starting supply of 750,000. This will be the final supply, and no supply key will be set.
```

3. Action's callback response:

```
Created new fungible token with id: 0.0.5526695

Details:
Name: GameGold
Symbol: GG
Decimals: 2
Initial supply: 750000
Supply Key: not set
Metadata Key: not set
Admin Key: not set
Token Metadata: And thats an example metadata
Memo: This is an example memo

Transaction link: https://hashscan.io/testnet/tx/0.0.5392887@1739795441.956136901
```

##### Other options

Other options are possible. The only requirement is providing the base 4 mandatory parameters:
- **name**
- **symbol** 
- **decimals**
- **initialSupply** 

Examples of other supported requests for this action:
```
Create a new token called CryptoCoin with symbol CCN, 6 decimals, and a total supply of 50000.
Create token GameGold with symbol GG, 2 decimal places, and starting supply of 750000. This is the final supply, don’t set a supply key.
Launch a new HTS token called SkyCredits with ticker SKC, 9 decimal places, and a total supply of 2500. The supply is fixed.
Create new HTS token PixelCoin with symbol PXN, 3 decimal places, and 500 tokens minted. I want to set the supply key and admin key.
Create a new token called CryptoCoin with symbol CCN, 6 decimals, and a total supply of 50000. Add memo 'example memo' and metadata: 'example metadata'.
```

---

### Airdrop Token

Airdrop Token action allows to airdrop tokens to up to 10 accounts.
Note that this action takes three mandatory parameters:
- **Token id** - id token to airdrop
- **amount** - amount of token in given in display format
- **recipients** - array of account ids of recipients

#### Example Prompts

Below is presented a flow of using Airdrop Token action

1. User input:

```
Airdrop 100 tokens 0.0.5450181 to 0.0.5450165 and 0.0.5450137.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Airdrop token successfully executed.
```

Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. 0.0.5423981).

Examples of other supported requests for this action:
```
Make airdrop of 2 tokens 0.0.5450643 to multiple wallets: 0.0.5392887, 0.0.5393076, 0.0.4515756
Send token airdrop of 2 tokens 0.0.5450643 to wallets: 0.0.5392887, 0.0.5393076, 0.0.4515756.
Airdrop token 0.0.5450643 to wallets: 0.0.5392887, 0.0.5393076, 0.0.4515756. Amount: 2.
```
---

### Show Pending Airdrops

Show Pending Airdrops allows to fetch pending airdrops for an account.
Note that this action takes one optional parameter
- **Account Id** - id of account for which the fetch should be performed, if not passed defaults to agents wallet

#### Example Prompts

Below is presented a flow of using Show Pending Airdrops action

**With default value of agents wallet**
1. User input:

```
Show me pending airdrops
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Here are pending airdrops for account 0.0.4515756 

(1) 100 KLR (token id: 0.0.5450181) from 0.0.5393196
(2) 0.0006 H$ (token id: 0.0.5450643) from 0.0.5393196
```

**With passing target account id**
1. User input:

```
Show pending airdrops for the account with id 0.0.5499883
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
There are no pending airdrops for accountId 0.0.5499883.
```

Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. 0.0.5423981).

Examples of other supported requests for this action:
```
Show your pending airdrops.
Show pending airdrops for the account with id 0.0.5499883
```
---

### Claim Airdrop

Claim Airdrop action allows claiming pending airdrop for the account connected with agent.
Note that this action takes two mandatory parameters:
- **Token id** - id of airdropped token
- **Account id** - id of account that airdropped the token

#### Example Prompts

Below is presented a flow of using Airdrop Token action

1. User input:

```
Claim airdrop 0.0006 H$ (token id: 0.0.5450643) from 0.0.5393196
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Successfully claimed airdrop for token 0.0.5450643.
Transaction link: https://hashscan.io/testnet/tx/0.0.4515756@1739271766.985013990
```

Examples of other supported requests for this action:
```
Accept airdrop of token 0.0.5450181 from account 0.0.5393196
Accept airdrop from account 0.0.5393196 containing token 0.0.5450181.
```

**Note:** the data about the airdrop passed to the function might be taken from the result of usage of `Show Pending Airdrops` action.

---

### Mint Token

Mint token action allows to mint additional supply of fungible token. To do that token should first have an agents key set as supply key assigned to it during its creation.
Note that this action takes two mandatory parameters:
- **Token id** - id of token to mint
- **Amount** - amount of tokens that should be minted. Given in display format

Minted token will be assigned to its creator account.

#### Example Prompts

Below is presented a flow of using Mint Token action

1. User input:

```
mint 10000000 tokens 0.0.5478757
```

2. LLM response - action execution:

```
I'll mint 10,000,000 of token 0.0.5478757 for you.
```

3. Action's callback response:

```
Successfully minted 10000000 of tokens 0.0.5478757
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1738849591.451351050
```

Examples of other supported requests for this action:
```
Mint 100 of 0.0.5478757
Generate 999 tokens 0.0.5478757
increase supply of token 0.0.5478757 by 9999
```

---

### Mint NFT Token

Mint NFT Token action allows to mint non-fungible token. To do that token should first have an agents key set as supply key assigned to it during its creation.
Note that this action takes two mandatory parameters:
- **Token id** - id of token to mint
- **Token Metadata** - metadata that will be embedded into the token

Minted token will be assigned to its creator account.

#### Example Prompts

Below is presented a flow of using Mint NFT Token action

1. User input:

```
Mint NFT 0.0.5512318 with metadata 'Testing this nft'.
```

2. LLM response - action execution:

```
I'll proceed to mint the NFT with token ID 0.0.5512318 and metadata 'Testing this nft'.
```

3. Action's callback response:

```
Successfully minted NFT 0.0.5512318
Transaction link: https://hashscan.io/testnet/tx/0.0.5392887@1739783546.150091504
```

Examples of other supported requests for this action:
```
Mint NFT 0.0.5478757. Set it's metadata to 'https://example.com/nft-image.png'.
Mint NFT with id 0.0.5478757. Assign 'https://example.com/nft-image.png' to its metadata.
```

---

### Reject Token

Reject token action allows to reject unwanted token received from airdrop on the Hedera network.
Note that this action takes one mandatory parameter:
- **Token id** - id of token to reject

Keep in mind that rejecting a token does not mean disassociating with it.

#### Example Prompts

Below is presented a flow of using Reject Token action

1. User input:

```
Reject token 0.0.5445349.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Successfully rejected token: 0.0.5445541. Tx hash: 0.0.5393196@1738313027.916224718
```

Currently, plugin supports rejecting only one token at once.

Examples of other supported requests for this action:
```
I don't want to accept the token 0.0.542086 from airdrop. Reject it.
I do not wish to receive token 0.0.112233. Reject it immediately.
Remove airdropped token 0.0.654321 from my account.
```

---

### Associate Token

Associate Token action allows to add selected token to your account. This action works with both fungible and non-fungible tokens.
Note that this action takes one mandatory parameter:
- **Token id** - id of token to associate - either fungible or non-fungible

#### Example Prompts

Below is presented a flow of using Associate Token action

1. User input:

```
Associate my wallet with token 0.0.5450063.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Token 0.0.5450063 has been associated with the account.
Transaction link: https://hashscan.io/testnet/transaction/1738313812.597816600
```

Currently, plugin supports associating with only one token for one prompt.

Examples of other supported requests for this action:
```
Please associate my account with token 0.0.111222.
Connect my wallet to token 0.0.333444.
Could you link token 0.0.555666 to my wallet?
Make my wallet associated with token 0.0.999000.
```

### Dissociate Token

Dissociate Token action allows to remove association with selected token from your account. Works with both fungible and non-fungible tokens.
Note that this action takes one mandatory parameter:
- **Token id** - id of token to dissociate

#### Example Prompts

Below is presented a flow of using Dissociate Token action

1. User input:

```
Dissociate my wallet with token0.0.5472930.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Token 0.0.5472930 has been dissociated from the account.
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1738744214.605233556
```

Currently, plugin supports dissociating with only one token for one prompt.

Examples of other supported requests for this action:
```
Please Dissociate my account with token 0.0.111222.
Disconnect my wallet to token 0.0.333444.
Could you unlink token 0.0.555666 from my wallet?
```

### Transfer HBAR

Transfer HBAR action allows to transfer HBAR from connected account to given account.
Note that this action takes two mandatory parameters:
- **Amount** - amount of HBAR to transfer (given in display unit)
- **Recipient AccountId** - address of wallet to receive the tokens

#### Example Prompts

Below is presented a flow of using Transfer HBAR action

1. User input:

```
Transfer 10 HBAR to account 0.0.5499760 
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Transfer of 10 HBAR to 0.0.5499760 completed.
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1739269481.061926306
```

Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. 0.0.5423981).

Examples of other supported requests for this action:
```
Make a transaction of 4 HBAR to 0.0.5392887.
Send 1 HBAR to account 0.0.5392887.
Transfer exactly 1.1 HBAR to 0.0.5392887.
```

---

### Transfer HTS Token

Transfer HTS Token action allows to transfer selected HTS token from connected account to given account.
Note that this action takes three mandatory parameters:
- **Amount** - amount of HTS token to transfer (given in display unit)
- **Recipient AccountId** - address of wallet to receive the tokens
- **Token Id** - id of token to transfer

#### Example Prompts

Below is presented a flow of using Transfer HTS Token action

1. User input:

```
Transfer 10 of 0.0.5450643 to account 0.0.5499760 
```

2. LLM response - action execution:

```
I'll help you transfer 10 tokens from 0.0.5450643 to account 0.0.5499760.
```

3. Action's callback response:

```
Transfer of token 0.0.5450643 to 0.0.5499760 completed.
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1739269394.302994738
```

Currently, EVM wallet addresses are **not supported.** Please pass Hedera addresses (ex. 0.0.5423981).

Examples of other supported requests for this action:
```
Make a transaction of 4 tokens with id 0.0.5450643 to 0.0.5392887.
Send 1 token 0.0.5450643 to account 0.0.5392887.
Transfer exactly 1.1 token 0.0.5450643 to 0.0.5392887.
```

### Get Topic Info

Get Topic Info action allows to fetch details about given topic by topic id.
Note that this action takes one mandatory parameter:
- **Topic Id** - id of topic (ex. `0.0.5473398`)

#### Example Prompts

Below is presented a flow of using Get Topic Info action

1. User input:

```
Give me details about topic 0.0.5473398
```

2. LLM response - action execution:

```
Fetching the details for topic ID 0.0.5473398. Please hold on for a moment.
```

3. Action's callback response:

```
Topic info for topic with id 0.0.5473398:
--------------------------------------
Memo: SimulatedTwins Verifiable Credentials Topic
Creation time: 2025-02-05T08:22:06.917Z
Expiration time: 2025-02-05T08:22:06.917Z
Admin key:
   not available
Submit key:
   e3b93603b0d533767e5ba73ffd6136a59b8554d322268ed4c92d7209efee472b
   type: ED25519
Deleted: false
--------------------------------------
Link: https://hashscan.io/testnet/topic/0.0.5473398
```

Examples of other supported requests for this action:
```
Show me info about topic 0.0.5473398.
Fetch topic details for 0.0.5473398.
Can you provide information on topic 0.0.5473398?
```

### Submit Topic Message

Submit Topic Message action posting messages to topics by topic IDs.
Note that this action takes two mandatory parameters:
- **Topic Id** - id of topic (ex. `0.0.5473398`)
- **Message** - string containing message

#### Example Prompts

Below is presented a flow of using Submit Topic Message action

1. User input:

```
submit message 'test test test' to topic 0.0.5475023.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Successfully submitted message to topic: 0.0.5475023
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1738767753.145858310
```

Examples of other supported requests for this action:
```
Submit message 'Hedera is great!' to topic 0.0.654321.
I want to post to topic 0.0.987654. Message: Smart contracts update.
Send 'DeFi price feed update' to topic 0.0.5475023.
```
**Note:**
you can post only to topics without submitKey or with submitKey form account that the agent is using.

---

### Create Topic

Create Topic action allows to create a new topic.
Note that this action takes two mandatory parameters:
- **memo** - short, string describing topic
- **isSubmitKey** - boolean, decides whether submitting messages to topic should be protected by submitKey 

#### Example Prompts

Below is presented a flow of using Create Topic action

##### Default option

1. User input:

```
Create topic with memo: test memo.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Successfully created topic: 0.0.5474228.
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1738758485.524585936
```
##### Option with requesting setting submitKey of topic to be created:
1. User input:

```
Create topic with memo: test. Please set submit key.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Topic with id: 0.0.5499850 created successfully.
Transaction link: https://hashscan.io/testnet/tx/0.0.5393196@1738758985.176879241
```

Examples of other supported requests for this action:
```
Create topic with memo: 'test message'. Please do not set submit key.
Create topic with memo test message.
Create topic with memo: test message.
Create topic with memo: test message.
Create topic with memo: test message. I want posting to it to be guarded.
Create topic with memo: 'test message' and submit key.
```

---

### Get Topic Messages

The **Get Topic Messages** action allows fetching messages published to a topic either without filtering or within a specified time range.

This action requires **one mandatory parameter** and supports **two optional parameters**:

- **`TopicId`** *(mandatory)* – The ID of the selected topic.
- **`lowerThreshold`** *(optional)* – A timestamp in the format `"YYYY-MM-DDTHH:MM:SS.NNNZ"`. If provided, it acts as a **"greater than or equal to"** condition.
- **`upperThreshold`** *(optional)* – A timestamp in the format `"YYYY-MM-DDTHH:MM:SS.NNNZ"`. If provided, it acts as a **"less than or equal to"** condition.

The `upperThreshold` and `lowerThreshold` parameters can be provided in natural language. The input will be automatically parsed into the required format by the LLM.

If only partial date information is provided (e.g., just the year and month), the LLM will infer the missing details.

**Examples**

- **User input:** `"2nd March 2024"`
    - **Parsed format:** `"2024-03-02T00:00:00.000Z"`
- **User input:** `"2nd March 2024 13:50"`
    - **Parsed format:** `"2024-03-02T13:50:00.000Z"`


#### Example Prompts

Below is presented a flow of using Get Topic Messages action

##### Default option

1. User input:

```
Get messages from topic 0.0.5473710.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Messages for topic 0.0.5473710:
-----------------------
Author: 0.0.5393196
Body: Lorem ipsum dolor sit amet, consectetur adipiscing elit...
Timestamp: 2025-02-07T07:36:17.144Z
-----------------------
Author: 0.0.5393196
Body: abcdefgh
Timestamp: 2025-02-07T07:35:31.000Z
-----------------------
Author: 0.0.5393196
Body: ala ma kota
Timestamp: 2025-02-07T07:35:06.703Z
-----------------------
Author: 0.0.5393196
Body: testmessage
Timestamp: 2025-02-05T10:04:05.797Z
```

##### Option with setting lower threshold

1. User input:

```
Get messages from topic 0.0.5473710 that were posted after 2025-02-06
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Messages for topic 0.0.5473710:
-----------------------
Author: 0.0.5393196
Body: Lorem ipsum dolor sit amet, consectetur adipiscing elit...
Timestamp: 2025-02-07T07:36:17.144Z
-----------------------
Author: 0.0.5393196
Body: abcdefgh
Timestamp: 2025-02-07T07:35:31.000Z
-----------------------
Author: 0.0.5393196
Body: ala ma kota
Timestamp: 2025-02-07T07:35:06.703Z


```
##### Option with setting full time range:
1. User input:

```
Get messages from topic 0.0.5473710 that were posted after 2025-02-06 and before 2025-02-07 07:35:31.000
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Messages for topic 0.0.5473710:
-----------------------
Author: 0.0.5393196
Body: abcdefgh
Timestamp: 2025-02-07T07:35:31.000Z
-----------------------
Author: 0.0.5393196
Body: ala ma kota
Timestamp: 2025-02-07T07:35:06.703Z

```


Examples of other supported requests for this action:
```
Get messages from topic 0.0.5473710 that were posted before 2025-02-07 07:35:31.000.
Get all posts for topic 0.0.5473710.
Show messages from topic 0.0.5473710. No date range set.
Show messages from topic 0.0.5473710 in range 01.01.2024 - 02.03.2025
Show messages from topic 0.0.5473710 in range 2022 - 2026.
```

**Note:** sometimes LLMs struggles with proper extracting of data from requests. It might happen if first request with specific data range was passed and then next prompt request for all posts (no data range therefore no params) is issued. 
In this case you might need to be more specific and use prompt `Show messages from topic 0.0.5473710. No time range.` instead of `Show messages from topic 0.0.5473710.`.

---

### Delete Topic

Delete Topic action allows to delete an existing topic.
Note that this action takes one mandatory parameter:
- **isSubmitKey** - boolean, decides whether submitting messages to topic should be protected by submitKey

#### Example Prompts

Below is presented a flow of using Delete Topic action

1. User input:

```
Delete Topic with id 0.0.5500697.
```

2. LLM response - action execution:

```
Calling relevant action. Please wait...
```

3. Action's callback response:

```
Successfully deleted topic 0.0.5500697.
Transaction link: https://hashscan.io/testnet/tx/0.0.4515756@1739281029.698340079
```

Examples of other supported requests for this action:
```
Create topic with memo: 'test message'. Please do not set submit key.
Create topic with memo test message.
Create topic with memo: test message.
Create topic with memo: test message.
Create topic with memo: test message. I want posting to it to be guarded.
Create topic with memo: 'test message' and submit key.
```

---

## Contribution

The plugin is still in development phase. It heavily depends on `hedera-agent-kit` library that is also in during development.
Consider this code as Proof of Concept that requires further improvements.
Areas of possible improvements:
- adding new actions
- improving reliability of data extraction (templates for each action data extraction are in `./src/templates`)
- unit testing the code

### Running Tests

Test are not implemented yet
