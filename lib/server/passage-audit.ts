import "server-only";

import type { PassageClassification } from "@/lib/route-planning";

const WALK_BIKE_METERS_PER_SECOND = 7_000 / 3_600;

type PassageAudit = {
  classification: PassageClassification;
  usesWalkBike: boolean;
};

function hasValue(tags: ReadonlyMap<string, string>, key: string, values: string[]) {
  const value = tags.get(key);
  return value !== undefined && value.split(";").some((part) => values.includes(part));
}

function hasConditionalAccess(tags: ReadonlyMap<string, string>) {
  return [...tags.keys()].some((key) =>
    ["access:conditional", "foot:conditional", "bicycle:conditional"].includes(key),
  );
}

function hasActiveConditionalPassageRestriction(tags: ReadonlyMap<string, string>) {
  return ["access:conditional", "foot:conditional"].some((key) =>
    hasValue(tags, key, ["active_restriction", "no", "private"]),
  );
}

function hasAccessGrant(tags: ReadonlyMap<string, string>) {
  return ["access", "foot", "bicycle"].some((key) =>
    hasValue(tags, key, ["yes", "public", "permissive", "designated", "official", "allowed"]),
  );
}

function hasAmbiguousAccessValue(tags: ReadonlyMap<string, string>) {
  return ["access", "foot", "bicycle"].some((key) =>
    hasValue(tags, key, [
      "unknown",
      "destination",
      "customers",
      "delivery",
      "agricultural",
      "forestry",
      "permit",
      "restricted",
      "residents",
      "employees",
    ]),
  );
}

function classifyAccessScope(
  tags: ReadonlyMap<string, string>,
): PassageClassification | null {
  if (hasActiveConditionalPassageRestriction(tags)) {
    return "explicit-exclusion";
  }

  if (hasConditionalAccess(tags)) {
    return "unverified-passage";
  }

  if (
    hasValue(tags, "access", ["no", "private"]) ||
    hasValue(tags, "foot", ["no", "private"])
  ) {
    return hasAccessGrant(tags) ? "unverified-passage" : "explicit-exclusion";
  }

  return null;
}

function classifyPassage(
  wayTags: ReadonlyMap<string, string>,
  nodeTags: ReadonlyMap<string, string>,
): PassageClassification {
  const barrier = nodeTags.get("barrier") ?? wayTags.get("barrier");
  const hasCriticalBarrier = barrier !== undefined && barrier !== "no";
  const hasStructuralExclusion =
    hasValue(wayTags, "closed", ["yes"]) ||
    hasValue(nodeTags, "closed", ["yes"]) ||
    (hasCriticalBarrier &&
      (hasValue(wayTags, "locked", ["yes"]) || hasValue(nodeTags, "locked", ["yes"]))) ||
    hasValue(wayTags, "smoothness", ["impassable"]) ||
    hasValue(wayTags, "impassable", ["yes"]) ||
    hasValue(nodeTags, "impassable", ["yes"]) ||
    (hasCriticalBarrier &&
      (hasValue(wayTags, "passable", ["no"]) || hasValue(nodeTags, "passable", ["no"])));
  if (hasStructuralExclusion) {
    return "explicit-exclusion";
  }

  const wayAccessClassification = classifyAccessScope(wayTags);
  const nodeAccessClassification = classifyAccessScope(nodeTags);
  if (
    wayAccessClassification === "explicit-exclusion" ||
    nodeAccessClassification === "explicit-exclusion"
  ) {
    return "explicit-exclusion";
  }
  if (
    wayAccessClassification === "unverified-passage" ||
    nodeAccessClassification === "unverified-passage"
  ) {
    return "unverified-passage";
  }

  const hasBicyclePassageDesignation = hasValue(wayTags, "designation", [
    "public_bridleway",
    "restricted_byway",
    "byway_open_to_all_traffic",
  ]);

  if (
    hasValue(wayTags, "bicycle", ["no", "private", "use_sidepath", "use_cycleway"]) ||
    hasValue(nodeTags, "bicycle", ["no", "private", "use_sidepath", "use_cycleway"]) ||
    hasAmbiguousAccessValue(wayTags) ||
    hasAmbiguousAccessValue(nodeTags) ||
    hasValue(wayTags, "vehicle", ["no", "private"]) ||
    hasValue(nodeTags, "vehicle", ["no", "private"]) ||
    (hasValue(wayTags, "highway", ["path", "footway"]) &&
      !wayTags.has("bicycle") &&
      !hasBicyclePassageDesignation)
  ) {
    return "unverified-passage";
  }

  return "eligible";
}

export function auditPassage(
  wayTags: ReadonlyMap<string, string>,
  nodeTags: ReadonlyMap<string, string>,
): PassageAudit {
  const classification = classifyPassage(wayTags, nodeTags);

  return {
    classification,
    usesWalkBike:
      classification === "unverified-passage" ||
      hasValue(wayTags, "bicycle", ["dismount"]) ||
      hasValue(nodeTags, "bicycle", ["dismount"]),
  };
}

export function approximatePassageDurationSeconds(
  distanceMeters: number,
  brouterDurationSeconds: number,
  usesWalkBike: boolean,
) {
  return usesWalkBike ? distanceMeters / WALK_BIKE_METERS_PER_SECOND : brouterDurationSeconds;
}
