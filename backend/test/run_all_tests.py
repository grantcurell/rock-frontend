"""
Runs all the unit tests for application.  This
folder should be discluded in production.
"""
import os
import unittest


PATH_TO_FILE = os.path.dirname(os.path.realpath(__file__))


def main():
    """
    Main method which will run all unit tests for the backend piece.

    :return:
    """
    loader = unittest.TestLoader()
    suite = loader.discover(PATH_TO_FILE)
    runner = unittest.TextTestRunner()
    runner.run(suite)


if __name__ == '__main__':
    main()
