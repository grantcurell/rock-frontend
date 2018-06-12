#!/usr/bin/python

#
# Example Usage:
# n = get_system_info('192.168.1.20', 'password')
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
        memory_mb (float): Available memory in MB
        memory_gb (float): Available memory in GB
        interfaces (list): List of Interface Objects
        cpu_cores (int): Available CPU Cores
        disks (list): List of Disk Objects
    """

    def __init__(self, fqdn):
        f = fqdn.encode("utf-8")
        self.hostname = f

    def set_memory(self, memory_mb):
        mem = float(memory_mb)
        self.memory_mb = mem
        self.memory_gb = (mem / 1024)

    def set_interfaces(self, interfaces):
        self.interfaces = interfaces

    def set_cpu_cores(self, cpu_cores):
        self.cpu_cores = int(cpu_cores)

    def set_disks(self, disks):
        self.disks = disks

    def __str__(self):
        p_interfaces = '\n'.join([str(x) for x in self.interfaces])
        p_disks = '\n'.join([str(x) for x in self.disks])
        return "Hostname: %s\nInterface List:\n%s\nCPU Cores: %s\nMemory MB: %.2f\nMemory GB: %.2f\nDisk List:\n%s\n" % (self.hostname, p_interfaces, self.cpu_cores, self.memory_mb, self.memory_gb, p_disks)

    def marshal(self):
        node = self
        setattr(node,'interfaces',json.dumps([interface.__dict__ for interface in node.interfaces]))
        setattr(node,'disks',json.dumps([disk.__dict__ for disk in node.disks]))
        return self.__dict__

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
        hasRoot (bool): Flag indicating whether or not a disk has the root of a filesystem present
    """

    def __init__(self, name):
        self.name = name
        self.hasRoot = False

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
        return "Disk: %s Size GB: %.2f Size TB: %.2f  HasRoot: %r" % (self.name, self.size_gb, self.size_tb, self.hasRoot)


def ansible_setup(server_ip, passwd):

    """Function opens ansible process to run setup on specified server and returns a json object:

    Arguments:
        server (str): fully qualified domain name of server
        passwd (str): password to server to create ansible ssh connection

    Return:
        Json object: Json object from ansible setup output

    """
    # Disable ssh host key checking
    os.environ['ANSIBLE_HOST_KEY_CHECKING'] = 'False'
    # The following runs ansible setup module on the target node
    # sed magic removes the "hostname | status =>" (ie: "192.168.1.21 | SUCCESS =>") from the beginning of the return to make the return a valid json object.
    p = os.popen("ansible all -m setup -e ansible_ssh_pass=" + passwd + " -i " + server_ip + ", | sed '1 s/^.*|.*=>.*$/{/g'").read()
    json_object = json.loads(p)

    if 'unreachable' in json_object:
        raise Exception("Error: " + json_object['msg'])

    return json_object

def transform(json_object):

    """Function transforms json object to node object:

    Arguments:
        json_object (Json): json object from ansible setup

    Return:
        node (Node object): Node object as specified above

    """
    try:
        # Get Disk
        ansible_devices = json_object['ansible_facts']['ansible_devices']
        disks = []
        partitionLinks = {}
        for i, k in ansible_devices.items():
            # We only want logical volume disks
            if k['model'] != None and k['removable'] != "1":
                disk = Disk(i)
                disk.set_size(k['size'])
                disks.append(disk)
            for j in k['partitions']:
                partitionLinks[j] = i
        #Get Disk links
        disklinks = {}
        masterlinks = {}
        for i in json_object['ansible_facts']['ansible_device_links']['uuids']:
            for k in json_object['ansible_facts']['ansible_device_links']['uuids'][i]:
                disklinks[k] = i

        for i in json_object['ansible_facts']['ansible_device_links']['masters']:
            for k in json_object['ansible_facts']['ansible_device_links']['masters'][i]:
                masterlinks[k] = i
        # Get Interfaces
        interfaces = []
        for i in json_object['ansible_facts']['ansible_interfaces']:
            ip=""
            mac=""
            # Do not return interfaces with veth, cni, docker or flannel
            if "veth" not in i and "cni" not in i and "docker" not in i and "flannel" not in i and "virbr0" not in i:
                name="ansible_" + i
                interface=json_object['ansible_facts'][name]
                if 'ipv4' in interface:
                    ip=interface['ipv4']['address']
                if 'macaddress' in interface:
                    mac=interface['macaddress']
                interfaces.append(Interface(i, ip, mac))

        # Determine location of root
        for i in json_object['ansible_facts']['ansible_mounts']:
           if i["mount"] == "/" or i["mount"] == "/boot":
                #Use the established reverse dictionaries to get our partition
                partVal = disklinks.get(i['uuid'])

                founddisk = next((x for x in disks if x.name == partVal), None)
                if founddisk != None:
                    founddisk.hasRoot = True

                masterPartVal = masterlinks.get(partVal)
                topPartVal = partitionLinks.get(partVal)
                founddisk = next((x for x in disks if x.name == topPartVal), None)
                if founddisk != None:
                    founddisk.hasRoot = True
                founddisk = next((x for x in disks if x.name == masterPartVal), None)
                if founddisk != None:
                    founddisk.hasRoot = True
                topPartVal = partitionLinks.get(masterPartVal)
                founddisk = next((x for x in disks if x.name == topPartVal), None)
                if founddisk != None:
                    founddisk.hasRoot = True

        # Get Memory
        memory=json_object['ansible_facts']['ansible_memory_mb']['real']['total']

        # Get Cores
        cores=json_object['ansible_facts']['ansible_processor_vcpus']

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
    except KeyError:
        raise KeyError("Error: Unable to process ansible json")

def get_system_info(server_ip, passwd):

    """Main function to gather system information on server:

    Arguments:
        server_ip (str): ip address of server
        passwd (str): password to server to create ansible ssh connection

    Return:
        node (Node object): Node object as specified above

    """

    # Connect to server and run ansible setup
    json_object = ansible_setup(server_ip, passwd)

    # Return node object
    return transform(json_object)
