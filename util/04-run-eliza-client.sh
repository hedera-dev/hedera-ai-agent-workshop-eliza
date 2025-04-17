#!/bin/bash

set -e

DIR="$( dirname -- "${BASH_SOURCE[0]}"; )";
cd ${DIR}/../eliza

sleep 10
if ! command -v gp 2>&1 >/dev/null ; then
  # Running in a local environment
  pnpm start:client
else
  # Running in gitpod
  SERVER_BASE_URL="$(gp url 3000)" pnpm start:client
fi
