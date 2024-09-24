redis-server --dir /data &
flask run --host=0.0.0.0 &
cp -r /install/node_modules ./tictactoe-client/
npm run --prefix tictactoe-client build-bundle && node tictactoe-client/server.js &
