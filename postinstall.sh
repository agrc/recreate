#!/bin/bash
if [[ -z "${TRAVIS}" ]] ; then
   git clone https://git.dts.utah.gov/agrc/recreate-secrets.git && cp recreate-secrets/.env .env
fi
