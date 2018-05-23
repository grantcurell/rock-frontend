from ceph_deploy.lib import remoto
from ceph_deploy.util.paths import gpg
from ceph_deploy.hosts.common import map_components


NON_SPLIT_PACKAGES = ['ceph-osd', 'ceph-mon', 'ceph-mds']

def repo_install():
    pass

def mirror_install():
    pass

def install(distro, version_kind, version, adjust_repos, **kw):
    packages = map_components(
        NON_SPLIT_PACKAGES,
        kw.pop('components', [])
    )
    gpgcheck = kw.pop('gpgcheck', 1)

    logger = distro.conn.logger
    release = 'el7'
    machine = distro.machine_type

    if version_kind in ['stable', 'testing']:
        key = 'release'
    else:
        key = 'autobuild'

    print packages
    distro.packager.install(
        packages
    )
