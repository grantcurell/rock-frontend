from ceph_deploy.lib import remoto
from ceph_deploy.hosts.centos.install import repo_install, mirror_install  # noqa
from ceph_deploy.util.paths import gpg
from ceph_deploy.hosts.common import map_components


NON_SPLIT_PACKAGES = ['ceph-osd', 'ceph-mon', 'ceph-mds']


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

    if adjust_repos:

        if version_kind in ['stable', 'testing']:
            distro.packager.add_repo_gpg_key(gpg.url(key))

            if version_kind == 'stable':
                url = 'https://download.ceph.com/rpm-{version}/{release}/'.format(
                    version=version,
                    release=release
                    )
            elif version_kind == 'testing':
                url = 'https://download.ceph.com/rpm-testing/el7/'

            remoto.process.run(
                distro.conn,
                [
                    'rpm',
                    '-Uvh',
                    '--replacepkgs',
                    '--force',
                    '--quiet',
                    '{url}noarch/ceph-release-1-1.{release}.noarch.rpm'.format(
                        url=url,
                        release=release,
                        ),
                ]
            )

            # set the right priority
            logger.warning('ensuring that /etc/yum.repos.d/ceph.repo contains a high priority')
            distro.conn.remote_module.set_repo_priority(['Ceph', 'Ceph-noarch', 'ceph-source'])
            logger.warning('altered ceph.repo priorities to contain: priority=1')

        elif version_kind in ['dev', 'dev_commit']:
            logger.info('skipping install of ceph-release package')
            logger.info('repo file will be created manually')
            mirror_install(
                distro,
                'http://gitbuilder.ceph.com/ceph-rpm-fc22-{machine}-basic/{sub}/{version}/'.format(
                    release=release.split(".", 1)[0],
                    machine=machine,
                    sub='ref' if version_kind == 'dev' else 'sha1',
                    version=version),
                gpg.url(key),
                adjust_repos=True,
                extra_installs=False,
                gpgcheck=gpgcheck,
            )

        else:
            raise Exception('unrecognized version_kind %s' % version_kind)

    print packages
    distro.packager.install(
        packages
    )
