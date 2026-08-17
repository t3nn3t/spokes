#!/usr/bin/env sh

set -eu

if [ "$#" -ne 4 ]; then
  echo "usage: prepare-lookups.sh <source> <output> <way-additions> <node-additions>" >&2
  exit 1
fi

source_lookup="$1"
output_lookup="$2"
way_additions="$3"
node_additions="$4"

if ! grep -q '^---lookupversion:11$' "$source_lookup" ||
  ! grep -q '^---minorversion:2$' "$source_lookup"; then
  echo "The pinned BRouter lookup table is not version 11.2." >&2
  exit 1
fi

awk -v way_additions="$way_additions" -v node_additions="$node_additions" '
  function append_file(path, line) {
    while ((getline line < path) > 0) print line
    close(path)
  }

  $0 == "---lookupversion:11" { print "---lookupversion:12"; next }
  $0 == "---minorversion:2" { print "---minorversion:1"; next }

  $0 == "access;0002688349 private restricted residents employees" {
    print "access;0002688349 private"
    next
  }

  $0 == "access;0000000001 military" {
    print
    print "access;0000000001 restricted"
    print "access;0000000001 residents"
    print "access;0000000001 employees"
    next
  }

  $0 == "---context:node" {
    append_file(way_additions)
    print
    next
  }

  { print }

  END { append_file(node_additions) }
' "$source_lookup" > "$output_lookup"

grep -q '^---lookupversion:12$' "$output_lookup"
grep -q '^---minorversion:1$' "$output_lookup"
