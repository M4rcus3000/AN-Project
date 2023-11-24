#!/bin/bash

#mysql -u admin -p -h database-1.cth6wfpv9jf0.us-east-1.rds.amazonaws.com

clear
echo "Starting"
sudo dnf update -y
sudo dnf upgrade -y
sudo yum install -y https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm
sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
sudo yum install -y mysql-community-client
clear
sleep 2
clear
sudo yum install nodejs npm 
sudo yum install yum-utils
# Update the package repository
sudo yum update -y
# Install required dependencies
sudo yum install -y git wget
npm install mammoth puppeteer
