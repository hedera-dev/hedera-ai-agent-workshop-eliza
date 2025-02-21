#!/bin/bash

set -e

DIR="$( dirname -- "${BASH_SOURCE[0]}"; )";
cd ${DIR}/../eliza

# Copy .env.example to .env if not present
if [ ! -f .env ]; then
  cp .env.example .env
fi
echo "Enter your OpenAI API Key:"
read -r OPENAI_API_KEY
echo "Enter your HEDERA_ACCOUNT_ID:"
read -r HEDERA_ACCOUNT_ID
echo "Enter your HEDERA_PRIVATE_KEY:"
read -r HEDERA_PRIVATE_KEY
echo "Enter your HEDERA_NETWORK_TYPE (testnet or mainnet):"
read -r HEDERA_NETWORK_TYPE
echo "Enter your HEDERA_KEY_TYPE (ECDSA or ED25519):"
read -r HEDERA_KEY_TYPE

# Update .env file with the provided variables
if grep -q "^OPENAI_API_KEY=" .env ; then
  sed -i~ "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|" .env
else
  echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
fi
if grep -q "^HEDERA_ACCOUNT_ID=" .env ; then
  sed -i~  "s|^HEDERA_ACCOUNT_ID=.*|HEDERA_ACCOUNT_ID=$HEDERA_ACCOUNT_ID|" .env
else
  echo "HEDERA_ACCOUNT_ID=$HEDERA_ACCOUNT_ID" >> .env
fi
if grep -q "^HEDERA_PRIVATE_KEY=" .env ; then
  sed -i~  "s|^HEDERA_PRIVATE_KEY=.*|HEDERA_PRIVATE_KEY=$HEDERA_PRIVATE_KEY|" .env
else
  echo "HEDERA_PRIVATE_KEY=$HEDERA_PRIVATE_KEY" >> .env
fi
if grep -q "^HEDERA_NETWORK_TYPE=" .env ; then
  sed -i~  "s|^HEDERA_NETWORK_TYPE=.*|HEDERA_NETWORK_TYPE=$HEDERA_NETWORK_TYPE|" .env
else
  echo "HEDERA_NETWORK_TYPE=$HEDERA_NETWORK_TYPE" >> .env
fi
if grep -q "^HEDERA_KEY_TYPE=" .env ; then
  sed -i~  "s|^HEDERA_KEY_TYPE=.*|HEDERA_KEY_TYPE=$HEDERA_KEY_TYPE|" .env
else
  echo "HEDERA_KEY_TYPE=$HEDERA_KEY_TYPE" >> .env
fi
