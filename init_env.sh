#!/bin/bash

# NPM has to be installed
# export SHARP_IGNORE_GLOBAL_LIBVIPS=1
npm -g install npm@8
npm set registry http://verdaccio:4873/

# Password for npm login is teawithsand JIC it's needed.