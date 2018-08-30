from app import socketio, mongo_console


def log_to_console(job_name: str, jobid: str, text: str) -> None:
    """
    Callback function that logs to console.

    :param job_name: The name of the job
    :param jobid: The jobid
    :param text: The console output string
    :return:
    """
    log = {'jobName': job_name, 'jobid': jobid, 'log': text}
    socketio.emit('message', log, broadcast=True)
    #socketio.emit(jobid, log, broadcast=True, namespace='/console')
    mongo_console.insert_one(log)

