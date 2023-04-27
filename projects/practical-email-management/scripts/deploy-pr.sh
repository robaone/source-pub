#!/bin/bash

function configure_script() {
  jq --null-input -c \
    --arg scriptId "$SCRIPT_ID" \
    '{"scriptId": $scriptId}' > .clasp.json 
}

function configure_credentials() {
  echo $GOOGLE_APP_SCRIPT_CREDENTIALS > $HOME/.clasprc.json
}
