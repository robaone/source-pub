#!/bin/bash

FILES="$(cat)"

SCRIPT_DIR=$(cd $(dirname $0); pwd)

if [ "$FIND_PATH" == "" ]; then
  FIND_PATH="$(which find)"
fi

if [ "$CAT_PATH" == "" ]; then
  CAT_PATH="$(which cat)"
fi

function file_exists() {
  if [ "$FILE_EXISTS_CMD" != "" ]; then
    $FILE_EXISTS_CMD "$FILE"
    return $?
  else
    if [ -f "$FILE" ]; then
      echo 1
    else
      echo 0
    fi
  fi
}
# Get the list of projects

function list_projects_with_depends_file() {
  PROJECTS_FOLDER="$SCRIPT_DIR/../../projects"
  for f in $($FIND_PATH $PROJECTS_FOLDER -name .depends)
  do
    echo $(basename $(dirname $f))
  done
  if [ "$(file_exists "$SCRIPT_DIR/../../.depends")" == "1" ]; then
    echo $(basename $(dirname $SCRIPT_DIR/../../.depends))
  fi
}

# For each project, check if the file is in the .depends file
PROJECTS="$(list_projects_with_depends_file)"
for project in $PROJECTS
do
  found=false
  DEPENDS_FILE_PATHS="$($CAT_PATH "$SCRIPT_DIR/../../projects/$project/.depends")"
  for file in $FILES
  do
    for depends_path in $DEPENDS_FILE_PATHS
    do
      DEPENDS_PATH_PATTERN=$(echo $depends_path | sed 's/\./\\./g' | sed 's/\*/.*/g')
      if [ "$(echo $file | grep ''$DEPENDS_PATH_PATTERN'')" != "" ]; then
        echo $project
        found=true
        break
      fi
    done
    if [ "$found" == "true" ]; then
      break
    fi
  done
done
