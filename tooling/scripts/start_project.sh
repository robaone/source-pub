#!/bin/bash

# Create a new project folder
# Insert a package.json file that has default values

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if the project name is provided
if [ -z "$1" ]; then
  echo "Please provide a project name"
  exit 1
fi

# Check if project name is all lower case and skewer case
if [[ ! "$1" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
  echo "Project name must be all lower case and skewer case"
  exit 1
fi

# Check if the project folder already exists
if [ -d "$SCRIPT_DIR/../../projects/$1" ]; then
  echo "Project folder already exists"
  exit 1
fi

# Create the project folder
mkdir "$SCRIPT_DIR/../../projects/$1"

# Copy the package.json file
cp "$SCRIPT_DIR/../templates/package.json" "$SCRIPT_DIR/../../projects/$1/package.json"

# Create README.md file
echo "# $1" > "$SCRIPT_DIR/../../projects/$1/README.md"

# Replace the project name in the package.json file
case "$(uname)" in
  Darwin*) sed -i '' "s/PROJECT_NAME/$1/g" "$SCRIPT_DIR/../../projects/$1/package.json" ;;
  *) sed -i "s/PROJECT_NAME/$1/g" "$SCRIPT_DIR/../../projects/$1/package.json" ;;
esac

