"""
Main __init__.py module that initializes the
REST interface for the frontend application.
"""
import logging

from flask_cors import CORS
from flask import Flask
from flask_socketio import SocketIO
from logging.handlers import RotatingFileHandler
from logging import Logger
from pathlib import Path
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient


APP_DIR = Path(__file__).parent  # type: Path
TEMPLATE_DIR = APP_DIR / 'templates'  # type: Path

_client = MongoClient('mongodb://localhost:27017/')
_tfplenum_database = _client.tfplenum_database  # type: Database
mongo_kickstart = _tfplenum_database.kickstart  # type: Collection
mongo_kickstart_archive = _tfplenum_database.kickstart_archive  # type: Collection
mongo_console = _tfplenum_database.console  # type: Collection

LOG_FILENAME = "/var/log/tfplenum/tfplenum.log"
logger = logging.getLogger('tfplenum_logger')


def setup_logger(log_handle: Logger, max_bytes: int=10000000, backup_count: int=10):
    """
    Sets up logging for the REST interface.

    :param log_handle:
    :param log_path:
    :param max_bytes:
    :param backup_count:
    :return:
    """
    handler = RotatingFileHandler(LOG_FILENAME, maxBytes=max_bytes, backupCount=backup_count)
    log_handle.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(levelname)7s:%(asctime)s:%(filename)20s:%(funcName)20s():%(lineno)5s:%(message)s')
    handler.setFormatter(formatter)
    log_handle.addHandler(handler)


setup_logger(logger)

# Setup Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app)

# Start the job manager
from app.job_manager import start_job_manager
start_job_manager()

# Load the views
from app import views
