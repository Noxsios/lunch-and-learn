#! /usr/bin/env bash

cargo install mdbook --vers "0.4.36" --locked

cargo install mdbook-catppuccin --vers "2.1.0" --locked

mdbook-catpuccin install

cargo install mdbook-admonish --vers "1.5.0" --locked

mdbook-admonish install .
