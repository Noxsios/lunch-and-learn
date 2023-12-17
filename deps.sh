#! /usr/bin/env bash

set -euo pipefail

# rustup update stable

cargo install mdbook --vers "0.4.36" --locked

cargo install mdbook-catppuccin --vers "2.1.0" --locked

mdbook-catppuccin install

cargo install mdbook-admonish --vers "1.5.0" --locked

mdbook-admonish install .
