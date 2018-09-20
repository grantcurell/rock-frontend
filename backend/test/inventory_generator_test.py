import os
import sys

PATH_TO_FILE = os.path.dirname(os.path.realpath(__file__))

sys.path.insert(0, PATH_TO_FILE + '/../')
print(sys.path)
import unittest
from app.inventory_generator import KickstartInventoryGenerator


TEST_DATA = {
    "advanced_settings": {
        "timezone": "Chicago"
    },
    "controller_interface": "172.16.77.251",
    "dhcp_end": "192.168.5.90",
    "dhcp_start": "192.168.5.50",
    "gateway": "192.168.5.1",
    "netmask": "255.255.255.0",
    "nodes": [
        {
            "boot_drive": "sda",
            "hostname": "dnav.lan",
            "ip_address": "192.168.1.1",
            "mac_address": "11:22:33:44:55:66",
            "node_type": "Server",
            "pxe_type": "BIOS"
        },
        {
            "boot_drive": "sda",
            "hostname": "dnav2.lan",
            "ip_address": "192.168.1.2",
            "mac_address": "11:22:33:44:55:67",
            "node_type": "Server",
            "pxe_type": "BIOS"
        }
    ],
    "number_of_nodes": "2",
    "root_password": "asdfasdf"
}


class TestInventoryGenerator(unittest.TestCase):
    """
    Class that tests the kickstart inventory generator.
    """

    def setUp(self):
        pass

    def testInventoryGeneration(self):
        """

        :return:
        """
        inventory_generator = KickstartInventoryGenerator(TEST_DATA)
        inventory_generator.generate()


if __name__ == "__main__":
    unittest.main()