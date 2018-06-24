
class sensor:
    def __init__(self, hostname, management_ipv4, bro_workers, moloch_threads, sensor_monitor_interface, pcap_disk, ceph_drive_list):
        self.hostname = hostname
        self.management_ipv4 = management_ipv4
        self.bro_workers = bro_workers
        self.moloch_threads = moloch_threads
        self.sensor_monitor_interface = sensor_monitor_interface
        self.pcap_disk = pcap_disk
        self.ceph_drive_list = ceph_drive_list

class server:
    def __init__(management_ipv4, ceph_disk_list):
        self.management_ipv4 = management_ipv4
        self.ceph_drive_list = ceph_disk_list
