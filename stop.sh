ps -ef | grep "node ./src/server.js" | grep -v grep | awk '{print $2}' | xargs kill
