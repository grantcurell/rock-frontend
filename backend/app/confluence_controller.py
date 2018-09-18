"""
Main module for handling all of the Confluence REST calls.
"""
import pymongo

from app import app
from app import _tfplenum_database as mongo_database
from app.common import NOTFOUND_RESPONSE
from flask import jsonify, Response
from pymongo.collection import Collection

CONFLUENCE_SPACE_PROJECTION = {'_id': True}


@app.route('/api/get_confluence_page/<space_id>/<page_id>', methods=['GET'])
def get_confluence_page(space_id: str, page_id: str) -> Response:
    """
    Gets the conflunce page content based on the passed in space_id and page_id:

    :param space_id: The ID of the confluence space.
    :param page_id: The ID of the confluence page.

    :return: Response object with a json dictionary.
    """
    mongo_collection = "confluence_" + space_id.lower()
    mongo_col = mongo_database[mongo_collection]  # type: Collection
    result = mongo_col.find_one({"_id": page_id})
    if result:
        return jsonify(result)

    return NOTFOUND_RESPONSE


@app.route('/api/get_spaces', methods=['GET'])
def get_confluence_spaces() -> Response:
    mongo_col = mongo_database["confluence_trees"]  # type: Collection
    json_docs = []
    spaces_cursor =  mongo_col.find({}, CONFLUENCE_SPACE_PROJECTION).sort("_id", pymongo.ASCENDING)
    if spaces_cursor:
        for space in spaces_cursor:
            json_docs.append(space)

        return jsonify(json_docs)

    return NOTFOUND_RESPONSE


@app.route('/api/get_navbar/<space_id>', methods=['GET'])
def get_navbar(space_id: str) -> Response:
    """
    Gets the NAV bar dictionary form the mongo datastore.

    :param space_id: The ID of the confluence space.

    :return: Response object with a json dictionary
    """
    mongo_col = mongo_database["confluence_trees"]  # type: Collection
    result = mongo_col.find_one({"_id": space_id})
    if result:
        return jsonify(result['nav_tree'])

    return NOTFOUND_RESPONSE
