#!/bin/bash

FILES=$(dirname $0)/tests/*.sh
export PACKAGE_PATH=$(dirname $0)/temp

for f in $FILES
do
  echo "Processing $f file..."
  PARENT_FOLDER=$(dirname $(dirname $f))
  FILE_NAME=$(basename $f)
  SCRIPT_FILE=$(echo $FILE_NAME | sed 's/_test[.]sh$/.sh/')
  $f "$PARENT_FOLDER/$SCRIPT_FILE"
  if [ "$?" != "0" ]; then
    exit 1
  fi
done
