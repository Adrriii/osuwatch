#!/bin/bash

su adri
source /home/adri/.bashrc
source /home/adri/.nvm/nvm.sh
nvm use 26
cd /main/osuwatch
npm run start