"""
Module contains classes and methods needed for generating the main projects
inventory files
"""
import os
from typing import Dict

from jinja2 import Environment, select_autoescape, FileSystemLoader
from app import TEMPLATE_DIR


JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)


class KickstartInventoryGenerator:
    """
    The KickstartInventory generator class.
    """

    def __init__(self, json_dict: Dict):
        self._template_ctx = json_dict

    def _map_dl160_and_supermicro(self) -> None:
        """
        Maps the DL160 and SuperMicro values to the appropriate values for the 
        inventory file.
        :return:
        """
        for node in self._template_ctx["nodes"]:            
            if node['pxe_type'] == "SuperMicro":
                node['pxe_type'] = "BIOS"
            elif node['pxe_type'] == "DL160":
                node['pxe_type'] = "UEFI"        

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._map_dl160_and_supermicro()
        template = JINJA_ENV.get_template('kickstart_inventory.yml')
        kickstart_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists("/opt/tfplenum-deployer/playbooks/"):
            os.makedirs("/opt/tfplenum-deployer/playbooks/")

        with open("/opt/tfplenum-deployer/playbooks/inventory.yml", "w") as kickstart_file:
            kickstart_file.write(kickstart_template)


class KitInventoryGenerator:
    """
    The KitInventory generator class
    """
    def __init__(self, json_dict: Dict):
        self._template_ctx = json_dict

    def _set_defaults(self) -> None:
        """
        Sets the defaults for fields that need to be set before template rendering.

        :return:
        """
        if not self._template_ctx["endgame_iporhost"]:
            self._template_ctx["endgame_iporhost"] = ''        

    def _map_ceph_redundancy(self) -> None:
        """
        Sets the ceph_redundancy value to the appropriate value before 
        adding it to the inventory file.
        :return:
        """
        if self._template_ctx["ceph_redundancy"]:
            self._template_ctx["ceph_redundancy"] = 2
        else:
            self._template_ctx["ceph_redundancy"] = 1        

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._map_ceph_redundancy()
        self._set_defaults()
        template = JINJA_ENV.get_template('inventory_template.yml')
        kit_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists("/opt/tfplenum/playbooks/"):
            os.makedirs("/opt/tfplenum/playbooks/")

        with open("/opt/tfplenum/playbooks/inventory.yml", "w") as kit_file:
            kit_file.write(kit_template)
