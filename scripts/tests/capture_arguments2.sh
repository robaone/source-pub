#!/bin/bash

# This script prints all arguments to a file

if [ "$ARGUMENT_FILE2" == "" ]; then
  echo "Please set the ARGUMENT_FILE2 environment variable"
  exit 1
fi

echo "$@" >> $ARGUMENT_FILE2
echo $MOCK_RESPONSE2
