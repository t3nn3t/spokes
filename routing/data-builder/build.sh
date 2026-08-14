#!/usr/bin/env bash

set -euo pipefail

readonly source_file="/source/hertfordshire-260813.osm.pbf"
readonly output_file="/segments4/W5_N50.rd5"
readonly work_directory="/tmp/spokes-map"
readonly java_memory="${BROUTER_MAP_MEMORY:-3G}"

if [[ ! -f "${source_file}" ]]; then
  echo "Missing ${source_file}; run npm run routing:data:source first." >&2
  exit 1
fi

rm -rf "${work_directory}"
mkdir -p \
  "${work_directory}/nodetiles" \
  "${work_directory}/waytiles" \
  "${work_directory}/waytiles55" \
  "${work_directory}/nodes55" \
  "${work_directory}/unodes55" \
  "${work_directory}/segments" \
  "${work_directory}/srtm1_bef" \
  "${work_directory}/srtm3_bef"

cd "${work_directory}"

java -Xmx"${java_memory}" -Xms512M -Xmn256M \
  -cp /app/brouter.jar \
  -DavoidMapPolling=true \
  -Ddeletetmpfiles=true \
  -DuseDenseMaps=true \
  btools.util.StackSampler \
  btools.mapcreator.OsmFastCutter \
  /app/profiles/lookups.dat \
  nodetiles waytiles nodes55 waytiles55 \
  bordernids.dat relations.dat restrictions.dat \
  /app/profiles/all.brf \
  /app/profiles/trekking.brf \
  /app/profiles/softaccess.brf \
  "${source_file}"

java -Xmx"${java_memory}" -Xms512M -Xmn256M \
  -cp /app/brouter.jar \
  -Ddeletetmpfiles=true \
  -DuseDenseMaps=true \
  btools.util.StackSampler \
  btools.mapcreator.PosUnifier \
  nodes55 unodes55 bordernids.dat bordernodes.dat \
  "${work_directory}/srtm1_bef" \
  "${work_directory}/srtm3_bef"

java -Xmx"${java_memory}" -Xms512M -Xmn256M \
  -cp /app/brouter.jar \
  -DuseDenseMaps=true \
  -DskipEncodingCheck=true \
  btools.util.StackSampler \
  btools.mapcreator.WayLinker \
  unodes55 waytiles55 bordernodes.dat restrictions.dat \
  /app/profiles/lookups.dat \
  /app/profiles/all.brf \
  segments rd5

if [[ ! -s "segments/W5_N50.rd5" ]]; then
  echo "BRouter did not create the expected W5_N50.rd5 tile." >&2
  exit 1
fi

install -m 0644 "segments/W5_N50.rd5" "${output_file}"
echo "Installed ${output_file}."
