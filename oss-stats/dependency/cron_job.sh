#!/bin/bash

echo "Starting the sbom generation and analysis process" 

#export github toekn here 

export PATH=$HOME/.nvm/versions/node/v20.16.0/bin:$PATH

current_dir="/home/ec2-user/test/community-tools/oss-stats/dependency"
cd $current_dir

#Cloning the repositories
rm -rf /home/ec2-user/test/cloned-repos/*
cd /home/ec2-user/test/cloned-repos
bash ../community-tools/oss-stats/dependency/clone-repos.sh 
cd $current_dir

#Generate sboms for all repos 
rm -rf /home/ec2-user/test/sboms/*
cd /home/ec2-user/test/cloned-repos
bash /home/ec2-user/test/community-tools/oss-stats/dependency/generate-sboms.sh
cd $current_dir

#Generate dependencies for each repo 
bash automate-dependencies-csv.sh 

#Generate components for each repo 
bash automate-components-csv.sh 

#Map unique dependencies accross all services and identify versions
node map.js 

#Append last publish details 
bash dependencies-services-last-publish.sh 

#Final csv- Find all unique components accross al repositories and merge it to dependencies 
node sbom-components-to-csv.js 

rm /home/ec2-user/test/community-tools/oss-stats/dependency/dependencies-services-last-publish.csv
rm /home/ec2-user/test/community-tools/oss-stats/dependency/dependency-services.csv

echo "Completed, please check components-dependencies"
