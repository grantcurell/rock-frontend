"""
Controller responsible for handling the scrolling
console box when we kick off jobs.
"""
from app import app, socketio, mongo_console
from app.common import OK_RESPONSE
from flask import request, jsonify, Response
from flask_socketio import emit


@socketio.on('connect')
def connect():
    print('Client connected')


@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')


@socketio.on('message')
def handle_message(msg):
    emit('message', {'message': msg})


@app.route('/api/generate_kit_inventory/<job_name>', methods=['GET'])
def get_console_logs(job_name: str) -> Response:
    """
    Gets the console logs by Job name.

    :param job_name: The name of the job (EX: Kickstart or Kit)
    """
    logs = list(mongo_console.find({"jobName": job_name}, {'_id': False}))
    return jsonify(logs)


@app.route('/api/remove_console_output', methods=['POST'])
def remove_console_logs() -> Response:
    """
    Removes console logs based on teh jobName.

    :return: OK Response.
    """
    payload = request.get_json()
    mongo_console.delete_many({'jobName': payload['jobName']})
    return OK_RESPONSE
