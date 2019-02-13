"""
This module is for storing standard functions which can be reused anywhere within the application.

"""
import base64


def netmask_to_cidr(netmask: str) -> int:
    '''
    Converts a standards netmask to the associated CIDR notation.

    :param netmask: netmask ip addr (eg: 255.255.255.0)
    :return: equivalent cidr number to given netmask ip (eg: 24)
    '''
    return sum([bin(int(x)).count('1') for x in netmask.split('.')])


def filter_ip(ipaddress: str) -> bool:
    """
    Filters IP addresses from NMAP functions commands.
    :return: 
    """
    if ipaddress.endswith('.0'):
        return True
    if ipaddress == '':
        return True
    return False


def encode_password(password: str) -> str:
    """
    Encodes a password and garbles is up.

    :param password: The password we wish to encode
    """
    if password is None or len(password) == 0:
        return ''
    return base64.b64encode(bytes(password, 'utf-8')).decode('utf-8')


def decode_password(password_enc: str) -> str:
    """
    Decodes a password.

    :param password_enc: The encoded password.
    """
    if password_enc is None or len(password_enc) == 0:
        return ''
    return base64.b64decode(bytes(password_enc, 'utf-8')).decode('utf-8')
