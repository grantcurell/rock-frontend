#!/usr/bin/python

# Example Usage:
# n = get_system_info('server1', 'password')
# print(n)

# Example how to get interfaces from node
# for i in n.interfaces:
#    print("Name: " + i.name)
#    print("Ip Address: " + i.ip_address)
#    print("Mac: " +i.mac_address)

import sys
import json
import os

class Node(object):
    """A node object which represents a server weather physical or virtual with the
    following properties:

    Attributes:
        hostname (str): Fully qualified domain name of server
        memory_gb (float): Available memory in GB
        memory_tb (float): Available memory in TB
        interfaces (list): List of Interface Objects
        cpu_cores (int): Available CPU Cores
        disks (list): List of Disk Objects

    """

    def __init__(self, fqdn):
        self.hostname = fqdn

    def set_memory(self, memory_mb):
        self.memory_mb = float(memory_mb)
        self.memory_gb = float((memory_mb / 1024))

    def set_interfaces(self, interfaces):
        self.interfaces = interfaces

    def set_cpu_cores(self, cpu_cores):
        self.cpu_cores = int(cpu_cores)

    def set_disks(self, disks):
        self.disks = disks

    def __str__(self):
        p_interfaces = '\n'.join([str(x) for x in self.interfaces])
        p_disks = '\n'.join([str(x) for x in self.disks])
        return "Hostname: %s\nInterface List:\n%s\nCPU Cores: %s\nMemory MB: %s\nMemory GB: %s\nDisk List:\n%s\n" % (self.hostname, p_interfaces, self.cpu_cores, self.memory_mb, self.memory_gb, p_disks)

class Interface(object):

    """An interface object which represents an interface on a server with the
    following properties:

    Attributes:
        name (str): Name of interface
        ip_address (str): Ip Address of interface not all interfaces have an ip address
        mac_address (str): Mac address of interface not all interfaces have a mac address

    """

    def __init__(self, name, ip_address, mac_address):
        self.name = name
        self.ip_address = ip_address
        self.mac_address = mac_address

    def __str__(self):
        return "Interface: %s Ip: %s Mac: %s" % (self.name, self.ip_address, self.mac_address)


class Disk(object):

    """A disk object which represents a logical disk on a server with the
    following properties:

    Attributes:
        name (str): Name of disk / storage device
        size_gb (float): Size of storage device in GB
        size_tb (float): Size of storage device in TB

    """

    def __init__(self, name):
        self.name = name

    def set_size(self, ansible_size):
        sizestr = ansible_size.encode("utf-8")
        sizesplit = sizestr.split(" ")

        self.size_gb = 0
        self.size_tb = 0

        size = float(sizesplit[0])

        if sizesplit[1] == "GB":
            self.size_gb = size
            self.size_tb = (size / 1024)
        if sizesplit[1] == "TB":
            self.size_gb = (size * 1024)
            self.size_tb = size

    def __str__(self):
        return "Disk: %s Size GB: %s Size TB: %s" % (self.name, self.size_gb, self.size_tb)


def create_tmp_inventory(server):

    """Function creates a temporary inventory file based off server hostname provided:

    Arguments:
        server (str): fully qualified domain name of server

    Return:
        None

    """

    file = open("/tmp/inventory.yml", "w")
    file.write("[all]")
    file.write("\n" + server)
    file.close()

def ansible_setup(server, passwd):

    """Function opens ansible process to run setup on specified server and returns a json object:

    Arguments:
        server (str): fully qualified domain name of server
        passwd (str): password to server to create ansible ssh connection

    Return:
        Json object: Json object from ansible setup output

    """

    p = os.popen("ansible -m setup " + server + " -i /tmp/inventory.yml -e ansible_ssh_pass=" +
                 passwd + " | sed '1 s/^.*|.*=>.*$/{/g'").read()
    json_object = json.loads(p)
    return json_object

def transform(json_object):

    """Function transforms json object to node object:

    Arguments:
        json_object (Json): json object from ansible setup

    Return:
        node (Node object): Node object as specified above

    """

    # Get Disk
    ansible_devices = json_object['ansible_facts']['ansible_devices']
    disks = []
    for i, k in ansible_devices.items():
        # We only want logical volume disks
        if k['model'] == "LOGICAL VOLUME":
            disk = Disk(i)
            disk.set_size(k['size'])
            disks.append(disk)

    # Get Interfaces
    interfaces = []
    for i in json_object['ansible_facts']['ansible_interfaces']:
        name="ansible_" + i
        interface=json_object['ansible_facts'][name]
        ip=""
        mac=""
        # Do not return interfaces with veth, cni, docker or flannel
        if "veth" not in i and "cni" not in i and "docker" not in i and "flannel" not in i:
            if 'ipv4' in interface:
                ip=interface['ipv4']['address']
            if 'macaddress' in interface:
                mac=interface['macaddress']
            interfaces.append(Interface(i, ip, mac))

    # Get Memory
    memory=json_object['ansible_facts']['ansible_memory_mb']['real']['total']

    # Get Cores
    cores=json_object['ansible_facts']['ansible_processor_cores']

    # Get FQDN
    fqdn=json_object['ansible_facts']['ansible_fqdn']

    # Create node object
    node = Node(fqdn)
    node.set_memory(memory)
    node.set_interfaces(interfaces)
    node.set_cpu_cores(cores)
    node.set_disks(disks)

    # Return Node object
    return node

def get_system_info(server, passwd):

    """Main function to gather system information on server:

    Arguments:
        server (str): fully qualified domain name of server
        passwd (str): password to server to create ansible ssh connection

    Return:
        node (Node object): Node object as specified above

    """

    # Create Temporary Ansible Inventory
    create_tmp_inventory(server)

    # Connect to server and run ansible setup
    json_object = ansible_setup(server, passwd)

    # Return node object
    return transform(json_object)
