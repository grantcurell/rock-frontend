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

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
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

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        template = JINJA_ENV.get_template('inventory_template.yml')
        kit_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists("/opt/tfplenum/playbooks/"):
            os.makedirs("/opt/tfplenum/playbooks/")

        with open("/opt/tfplenum/playbooks/inventory.yml", "w") as kit_file:
            kit_file.write(kit_template)
