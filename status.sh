#!/bin/bash
service=./src/server.js

if (( $(ps -ef | grep -v grep | grep $service | wc -l) > 0 ))
then
echo "$service is running!!!"
else
echo "$service is stopped."
fi
