
class Sensor:
    hostname = None
    management_ipv4 = None
    bro_workers = None
    moloch_threads = None
    sensor_monitor_interfaces = []
    pcap_disk = None
    ceph_drive_list = []

class Server:
    hostname = None
    management_ipv4 = None
    ceph_drive_list = []


class Node:
    hostname = None
    ip_address = None
    mac_address = None   
    pxe_type = None
    boot_drive = None