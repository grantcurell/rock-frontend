class Sensor:    
    def __init__(self):
        self.hostname = None
        self.management_ipv4 = None
        self.bro_workers = None
        self.moloch_threads = None
        self.sensor_monitor_interfaces = []
        self.pcap_disk = None
        self.ceph_drive_list = []


class Server:
    def __init__(self):
        self.hostname = None
        self.management_ipv4 = None
        self.ceph_drive_list = []


class Node:
    def __init__(self):
        self.hostname = None
        self.ip_address = None
        self.mac_address = None   
        self.pxe_type = None
        self.boot_drive = None
