#!/usr/bin/env sh

set -eu

runtime_profiles="/tmp/spokes-profiles"
mkdir -p "$runtime_profiles"
cp -R /profiles2/. "$runtime_profiles"

sh /spokes/prepare-lookups.sh \
  /profiles2/lookups.dat \
  "$runtime_profiles/lookups.dat" \
  /spokes/way-lookups.dat \
  /spokes/node-lookups.dat

export PROFILESPATH="$runtime_profiles"
exec /app/server.sh
