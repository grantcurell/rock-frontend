#!/bin/bash

function _install_and_start_mongo40 {

cat <<EOF > /etc/yum.repos.d/mongodb-org-4.0.repo
[mongodb-org-4.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc
EOF

	yum install -y mongodb-org	
	systemctl enable mongod
    systemctl start mongod
}

_install_and_start_mongo40

mkdir -p /var/log/tfplenum/