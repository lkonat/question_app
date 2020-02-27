#!/bin/sh
set -e
export LANG=en_US.UTF-8
# redirect output to log
{ 
  kill $1
  npm start
} >>start_log.txt 2>&1