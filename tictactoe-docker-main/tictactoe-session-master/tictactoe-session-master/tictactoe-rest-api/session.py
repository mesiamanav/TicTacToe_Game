from flask import Flask
from flask import jsonify
from flask import request
from flask_restful import Resource, Api
from flask import abort
from flask_cors import CORS
import flask
import redis
import datetime
import json

import sys
print(sys.version)

app = Flask(__name__)
CORS(app)

# TODO read this config from config file
red = redis.StrictRedis(host="0.0.0.0")

winLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
]

# TODO pass session_id as channel
# also should consider streaming only the moves, sync on sendMove response
def event_stream():
    pubsub = red.pubsub()
    pubsub.subscribe('moves')
    for message in pubsub.listen():
        data = message['data']
        try:
            data = message['data'].decode()
        except AttributeError:
            pass
        yield 'data: %s\n\n' % data

################################################################################

# TODO publish by session_id @app.route('/events/:session_id')
@app.route('/events')
def stream():
    return flask.Response(event_stream(),
                          mimetype="text/event-stream")

# endpint to retrieve session
@app.route('/session')
def session():
    state = red.get('gamestate')

    # start new game
    if state is None:
        initState = json.dumps({'board': ([None] * 9), 'turnSymbol': 'x', 'gameActive': True, 'winner' : None}, separators=(',', ':'))
        red.set('gamestate', initState)
        red.publish('moves', initState)
        return initState

    return state

# endpint to reset the game state
@app.route('/resetGame')
def resetGame():

    message = json.dumps({'board': ([None] * 9), 'turnSymbol': 'x', 'gameActive': True, 'winner' : None}, separators=(',', ':'))
    red.set('gamestate', message)

    user = flask.session.get('user', 'ttt-master')
    now = datetime.datetime.now().replace(microsecond=0).time()
    publishToStream(message, user, now)

    data = {'message': 'game reset'}
    return jsonify(data), 201

# receive new move and update game state and publish through redis
@app.route('/sendMove', methods=['POST'])
def sendMove():

    if not request.json or not 'move' in request.json:
        abort(400)
    move = request.json['move']

    # retrieve state, modify, publish
    state = json.loads(red.get('gamestate').decode('utf-8'))

    if move < 9 and state['board'][move] is None and state['gameActive']:
        state['board'][move] = state['turnSymbol'].upper()
        winLine = evaluateState(state['board'])
        if winLine:
            state['gameActive'] = False
            state['winner'] = state['turnSymbol']
            state['winLine'] = winLine
            message = json.dumps(state, separators=(',', ':'))

            red.set('gamestate', message)
            # store state to persistent

            user = flask.session.get('user', 'ttt-master')
            now = datetime.datetime.now().replace(microsecond=0).time()
            publishToStream(message, user, now)
            return message, 201

        if isTie(state['board']):
            state['gameActive'] = False
            state['winner'] = "tie"
            message = json.dumps(state, separators=(',', ':'))

            red.set('gamestate', message)

            user = flask.session.get('user', 'ttt-master')
            now = datetime.datetime.now().replace(microsecond=0).time()
            publishToStream(message, user, now)

            return message, 201

        state['turnSymbol'] = 'o' if state['turnSymbol'] == 'x' else 'x'
        message = json.dumps(state, separators=(',', ':'))
        red.set('gamestate', message)
        # store state to persistent

        user = flask.session.get('user', 'ttt-master')
        now = datetime.datetime.now().replace(microsecond=0).time()
        publishToStream(message, user, now)

        # no winner yet
        data = {'message': 'valid move'}
        return jsonify(data), 201
    else:
        abort(400, {'message': 'invalid move'})

################################################################################

def publishToStream(message, user, now):
    red.publish('moves', message)

def isTie(state):
    for sq in state:
        if sq is None:
            return False
    return True

# check for winner
def evaluateState(state):
    for line in winLines:
        a, b, c = line;
        if state[a] and state[a] == state[b] and state[a] == state[c]:
            return line
    return None

if __name__ == '__main__':
    app.run(debug=True)
