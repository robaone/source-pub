#!/bin/bash

# This script prints all arguments to a file

if [ "$ARGUMENT_FILE1" == "" ]; then
  echo "Please set the ARGUMENT_FILE1 environment variable"
  exit 1
fi

echo "$@" >> $ARGUMENT_FILE1
echo $MOCK_RESPONSE1
