#!/bin/bash

su adri
source /home/adri/.bashrc
source /home/adri/.nvm/nvm.sh
nvm use v22.13.0
cd /main/osuwatch
npm run start