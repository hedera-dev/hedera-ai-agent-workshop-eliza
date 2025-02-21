# Hedera AI and agents workshop

Demo repo for the Hedera AI and agents workshop.

## How to run using Gitpod

To run on Gitpod (a cloud development environment), click the button below:

<a href="https://gitpod.io/?autostart=true&editor=code&workspaceClass=g1-standard#https://github.com/hedera-dev/hedera-ai-agent-workshop" target="_blank" rel="noreferrer">
  <img src="./img/gitpod-open-button.svg" />
</a>

1. Wait for Gitpod to load, this should take less than 10 seconds
1. In the VS code terminal, you should see 4 terminals:
  `config_eliza`, `install_eliza`, `run_eliza`, and `run_client_eliza`
1. In the `config_eliza` terminal, a script will interactively prompt you for your LLM API key and your Hedera network credentials
1. Congratulations, you can now move on to the sequences! 🎉

## Sequences

This repo contains the code required to configure and run Eliza,
then use Hedera AI agents to query and transact on Hedera.
The following sections outline what each sequence will cover.

<!--
[Go to accompanying tutorial](#TODO_TUTORIAL_SEQUENCE_LINK). (WIP)
-->

What you will accomplish:

1. Configure Eliza with LLM credentials and Hedera credentials
2. Run Eliza server and Eliza client
3. Query Hedera network state (no transaction)
4. Modify Hedera network state (transaction)

Video:

[![](https://i.ytimg.com/vi/lKVrJ0o-G5o/maxresdefault.jpg)](https://www.youtube.com/watch?v=lKVrJ0o-G5o&list=PLjyCRcs63y83i7c9A4UJxP8BYcTgpjqTJ)

Steps:

1. Check that you have your `.env` file updated with all the required keys.
   These will be prompted in the `config_eliza` terminal.
   - If you skipped this, you can manually edit the `.env` file
1. Open the character file for the Hedera AI agent
   - You can find this in `eliza-hedera/characters/hedera.character.json`
   - If you are using a different LLM provider:
     - Edit this file to set the value of the model provider.
       - For example, for OpenRouter: `"modelProvider": "openrouter",`
     - Ensure that you have the necessary configurations for your chosen LLM in the `.env` file.
       - For example, for OpenRouter: `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.
2. Wait for Eliza installation to complete.
   - This happens in the `install_eliza` terminal.
   - Note that this takes more than 5 minutes, even on a fast Internet connection.
3. Wait for the Eliza server to start.
   - This happens in the `run_eliza` terminal
4. Wait for the Eliza client to start.
   - This happens in the `run_client_eliza` terminal
5. Open the Eliza client in a new browser tab
   - This should open automatically for you.
   - If not, click on `PORTS`, and in the table, click on the `Address` for port 5173
6. In the list of agents, press the `Chat` button under `HederaHelper`
   - You will now see a chat interface.
7. Let's query state on the Hedera network!
   - Example message from you:
     - `Hi! What is the HBAR balance of account ID 0.0.1534 ?`
     - Note: Replace `0.0.1534` with your account ID
   - Example response from Hedera AI agent:
     - `Hello! I'm HederaHelper, here to help you with all your Hedera-related operations. Let me check the balance of my account (0.0.1534) for you.`
     - `Address 0.0.1534 has balance of 9441.62 HBAR`
     - Action: Verify that displayed in the corner of the message, there is also the name of the *action* the agent intends to perform via Hedera Agent Kit. This should be `HEDERA_HBAR_BALANCE`
   - Navigate to your account ID on Hashscan
     - Action: Verify that the Hedera AI agent has output the correct HBAR balance!
8. Let's update state on the Hedera network!
   - Example message from you:
     - `Can you please create an HCS topic with the memo "Brendan's topic created using Hedera AI Agent on Eliza" ?`
     - Note: Replace `Brendan` with your own name
   - Example response from Hedera AI agent:
     - `I'll create the new HCS topic with the memo "Brendan's topic created using Hedera AI Agent on Eliza" (HEDERA_CREATE_TOPIC)`
   - `Successfully created topic: 0.0.5533495 Transaction link: https://hashscan.io/testnet/transaction/1739956989.737784273`
     - Action: Verify that displayed in the corner of the message, there is also the name of the *action* the agent intends to perform via Hedera Agent Kit. This should be `HEDERA_CREATE_TOPIC`
   - Navigate to the topic ID or transaction URL output on Hashscan
     - Action: Verify that the Hedera AI agent has actually created the topic correctly, and the topic memo is what you requested.

## Author

[Brendan Graetz](https://blog.bguiz.com/)

## Licence

MIT
