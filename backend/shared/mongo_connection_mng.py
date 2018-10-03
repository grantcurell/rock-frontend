from pymongo.collection import Collection
from pymongo.database import Database
from pymongo import MongoClient


class MongoConnectionManager(object):
    """
    Managment class for handling mongo connections.
    """

    def __init__(self):
        self._client = MongoClient('mongodb://localhost:27017/')
        self._tfplenum_database = self._client.tfplenum_database  # type: Database

    @property
    def mongo_database(self) -> Database:
        """
        Returns the mongo database management object so that we can create dynamic collections.

        :return:
        """
        return self._tfplenum_database

    @property
    def mongo_kickstart(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kickstart

    @property
    def mongo_kit(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kit

    @property
    def mongo_kickstart_archive(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kickstart_archive

    @property
    def mongo_console(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.console

    @property
    def mongo_portal(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.portal

    @property
    def mongo_kubernetes_pods(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kubernetes_pods

    @property
    def mongo_kubernetes_nodes(self) -> Collection:
        """
        Returns a mongo object that can do database manipulations.

        :return:
        """
        return self._tfplenum_database.kubernetes_nodes

    def __enter__(self):
        """
        Function executes within a given contenxt  (IE: with MongoConnectionManager() as mng:)

        :return:
        """        
        return self

    def __exit__(self, *exc) -> None:
        """
        Executes after completion

        :param exc_type:
        :param exc_val:
        :param exc_tb:
        :return:
        """
        if self._client:
            self._client.close()
