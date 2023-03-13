#!/bin/bash

BUILD_FOLDER=build

if [ ! -d "$BUILD_FOLDER" ]; then
  mkdir $BUILD_FOLDER
fi

if [ "$SCRIPT_ID" == "" ]; then
  SCRIPT_ID=$(cat .clasp.json | jq -r .scriptId)
fi

if [ "$SCRIPT_ID" == "" ]; then
  echo "SCRIPT_ID is empty"
  exit 1
fi

cp src/appsscript.json $BUILD_FOLDER/
for FILE in src/*.js; do 
  sed -ne '/\/\/ start-app-script/,/\/\/ end-app-script/p' $FILE | grep -vE '\/\/ (start|end)-app-script' > $BUILD_FOLDER/$(basename $FILE)
done

jq --null-input -c \
  --arg scriptId "$SCRIPT_ID" \
  --arg rootDir "$BUILD_FOLDER" \
  '{"scriptId": $scriptId, "rootDir": "."}' > $BUILD_FOLDER/.clasp.json
