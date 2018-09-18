"""
Module that has commonly shared things between controller modules.
You can put constants or shared functions in this module.
"""
from flask import Response

OK_RESPONSE = Response()
OK_RESPONSE.status_code = 200

NOTFOUND_RESPONSE = Response()
NOTFOUND_RESPONSE.status_code = 404

ERROR_RESPONSE = Response()
ERROR_RESPONSE.status_code = 500