"""
Module manages the mongo client used by the scraper.
"""
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient
from typing import Dict, List

MONGO_COL_TREE_NAME = 'confluence_trees'

class MongoClientWrapper:
    """

    """
    def __init__(self):
        print("__init__")
        self._client = None
        self._rock_database = None
        self._collection_name = None

    def __enter__(self):
        print("__enter__")
        self._client = MongoClient('mongodb://localhost:27017/')
        self._rock_database = self._client.rock_database  # type: Database
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("__exit__")
        if self._client:
            self._client.close()

    def set_collection_names(self, confluence_space: str):
        """
        Sets the mongo collection names based on the confluence space.

        :param confluence_space:
        :return:
        """
        self._collection_name = "confluence_" + confluence_space.lower()
        self._create_collections()

    def _create_collections(self):
        """
        Creates a new mongo collection based on the passed in name.
        :return:
        """
        #self._rock_database[self._collection_name].update({}, {})
        self._rock_database[self._collection_name].drop()
        self._rock_database[MONGO_COL_TREE_NAME].drop()

    def insert_page(self, document: Dict):
        """
        Inserts one document into the mongodb

        :param document:
        :return:
        """
        mongo_col = self._rock_database[self._collection_name]  # type: Collection
        mongo_col.insert_one(document)

    def insert_tree(self, confluence_space_id: str, nav_tree: List):
        mongo_col = self._rock_database[MONGO_COL_TREE_NAME]  # type: Collection
        mongo_col.insert_one({"_id": confluence_space_id, "nav_tree": nav_tree})
