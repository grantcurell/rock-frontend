#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
FRONTEND_DIR="/opt/tfplenum-frontend"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd $SCRIPT_DIR > /dev/null
source ./common.in

function use_laprepos() {
    if [ -z "$TFPLENUM_LABREPO" ]; then
        echo "Do you want to use labrepo for downloads? (Requires Dev Network)"
        select cr in "YES" "NO"; do
            case $cr in
                YES ) export TFPLENUM_LABREPO=true; break;;
                NO ) export TFPLENUM_LABREPO=false; break;;
            esac
        done
    fi

    if [ "$TFPLENUM_LABREPO" == true ]; then
        local os_id=$(awk -F= '/^ID=/{print $2}' /etc/os-release)
        rm -rf /etc/yum.repos.d/*offline* > /dev/null
        rm -rf /etc/yum.repos.d/labrepo* > /dev/null
        if [ "$os_id" == '"centos"' ]; then
            run_cmd curl -m 10 -s -o /etc/yum.repos.d/labrepo-centos.repo http://yum.labrepo.lan/labrepo-centos.repo
        else
            run_cmd curl -m 10 -s -o /etc/yum.repos.d/labrepo-rhel.repo http://yum.labrepo.lan/labrepo-rhel.repo
        fi
        yum clean all > /dev/null
        rm -rf /var/cache/yum/ > /dev/null
    fi
}

function _install_deps(){
	if [ "$TFPLENUM_LABREPO" == false ]; then
		yum -y install epel-release
	fi

	yum -y install wget nmap
}

function _install_nodejs(){

	if [ "$TFPLENUM_LABREPO" == true ]; then
		run_cmd wget http://misc.labrepo.lan/node-v8.11.4-linux-x64.tar.xz
	else
		run_cmd wget https://nodejs.org/dist/v8.11.4/node-v8.11.4-linux-x64.tar.xz
	fi

    run_cmd tar xf node-v8.11.4-linux-x64.tar.xz
    run_cmd cd node-v8.11.4-linux-x64/
    run_cmd cp -R * /usr/local/
    run_cmd cd ..
	run_cmd rm -rf node-v8.11.4-linux-x64/
	run_cmd rm -f node-v8.11.4-linux-x64.tar.xz
    run_cmd node -v
    run_cmd npm -v
    if [ "$TFPLENUM_LABREPO" == true ]; then
      npm config set registry http://nexus.labrepo.lan/repository/npm/
    fi
}

function _install_angular(){
    run_cmd npm install -g @angular/cli
	pushd $FRONTEND_DIR/frontend > /dev/null
	run_cmd npm update -g
    run_cmd npm install --save-dev @angular-devkit/build-angular
    run_cmd npm install
	popd > /dev/null
}

function _open_firewall_ports(){
    firewall-cmd --permanent --add-port=4200/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
}

function _install_python36(){
	run_cmd yum install -y gcc
	run_cmd yum install -y python36 python36-devel
	mkdir -p /root/.pip/

  if [ "$TFPLENUM_LABREPO" == true ]; then
cat <<EOF > /root/.pip/pip.conf
[global]
index-url = http://nexus.labrepo.lan/repository/pypi/simple
trusted-host = nexus.labrepo.lan
EOF
  fi
}

function _setup_pythonenv {
	pushd $FRONTEND_DIR/ > /dev/null
  systemctl is-active tfplenum-frontend && systemctl stop tfplenum-frontend # If it's running, it needs to be stopped
	run_cmd rm -rf /opt/tfplenum-frontend/tfp-env
	run_cmd python3.6 -m venv tfp-env
	run_cmd /opt/tfplenum-frontend/tfp-env/bin/pip install --upgrade pip
	run_cmd /opt/tfplenum-frontend/tfp-env/bin/pip install -r requirements.txt
	popd > /dev/null
}

function _configure_httpd {
	local private_key="/etc/ssl/private/apache-selfsigned.key"
	local certificate="/etc/ssl/certs/apache-selfsigned.crt"
	run_cmd yum -y install httpd
	run_cmd yum -y install mod_ssl

	# On RHEL these lines are needed because they do not not automatically allow connectivity.
	/usr/sbin/setsebool httpd_can_network_connect 1
	/usr/sbin/setsebool -P httpd_can_network_connect 1

	mkdir /etc/ssl/private
	run_cmd chmod 700 /etc/ssl/private
	run_cmd openssl req -x509 -nodes -subj "/C=US/ST=Texas/L=Dallas/O=uknown/CN=tfplenum" -days 36500 -newkey rsa:4096 -keyout $private_key -out $certificate
	run_cmd chmod 600 $private_key
	run_cmd chmod 644 $certificate
	run_cmd openssl dhparam -dsaparam -out /etc/ssl/certs/dhparam.pem 4096
	run_cmd cat /etc/ssl/certs/dhparam.pem | sudo tee -a /etc/ssl/certs/apache-selfsigned.crt
	mv -v /etc/httpd/conf.d/ssl.conf /etc/httpd/conf.d/ssl.conf.bak
	run_cmd cp -v ./tfplenum.conf /etc/httpd/conf.d/
    run_cmd rm -rf /etc/httpd/conf.d/welcome.conf
}

function _install_and_configure_gunicorn {
	cp ./tfplenum-frontend.service /etc/systemd/system/
	run_cmd systemctl daemon-reload
	run_cmd systemctl enable tfplenum-frontend.service
}

function _install_and_start_mongo40 {
	if [ "$TFPLENUM_LABREPO" == false ]; then
cat <<EOF > /etc/yum.repos.d/mongodb-org-4.0.repo
[mongodb-org-4.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc
EOF
	fi

	run_cmd yum install -y mongodb-org
	run_cmd systemctl enable mongod
}

rm -rf ~/.pip
mkdir -p /var/log/tfplenum/
use_laprepos
_install_deps
_install_nodejs
_install_angular
_install_python36
_setup_pythonenv
_configure_httpd
_deploy_angular_application
_install_and_configure_gunicorn
_install_and_start_mongo40
_restart_services
_open_firewall_ports

popd > /dev/null
