#!/bin/bash

set -e

DIR="$( dirname -- "${BASH_SOURCE[0]}"; )";
cd ${DIR}/../eliza-hedera

pnpm install --no-frozen-lockfile && \
    pnpm build
