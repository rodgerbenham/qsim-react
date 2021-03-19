#!/bin/bash

# To make the build:
#  "homepage": "/ccnews-explorer/",
#
# in package.json
# then npm run build

mv package.json package-dev.json

# package-prod has a homepage entry
cp package-prod.json package.json

npm run build

mv package-dev.json package.json
