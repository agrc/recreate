#!/bin/bash
if [ ! "$TRAVIS" == "true" -a ! -r .env ] ; then
   git clone https://git.dts.utah.gov/agrc/recreate-secrets.git && cp recreate-secrets/.env .env
fi
