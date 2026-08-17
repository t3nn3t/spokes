import "server-only";

import type {
  MotorExposureTier,
  MotorRoadCrossing,
} from "@/lib/route-planning";

type MotorTrafficAudit = {
  exposureTier: MotorExposureTier;
  crossing: MotorRoadCrossing;
  crossingPenalty: number;
};

const NON_MOTOR_HIGHWAYS = new Set([
  "bridleway",
  "cycleway",
  "footway",
  "path",
  "pedestrian",
  "steps",
]);

const MAJOR_HIGHWAYS = new Set([
  "motorway",
  "motorway_link",
  "primary",
  "primary_link",
  "secondary",
  "secondary_link",
  "trunk",
  "trunk_link",
]);

const RESTRICTED_MOTOR_ACCESS = [
  "agricultural",
  "customers",
  "delivery",
  "destination",
  "forestry",
  "permit",
];

function hasValue(tags: ReadonlyMap<string, string>, key: string, values: string[]) {
  const value = tags.get(key);
  return value !== undefined && value.split(";").some((part) => values.includes(part));
}

function tagValues(tags: ReadonlyMap<string, string>, key: string) {
  return tags.get(key)?.split(";") ?? null;
}

function effectiveMotorAccess(tags: ReadonlyMap<string, string>) {
  return (
    tagValues(tags, "motor_vehicle") ??
    tagValues(tags, "vehicle") ??
    tagValues(tags, "access")
  );
}

function includesValue(values: string[] | null, candidates: string[]) {
  return values?.some((value) => candidates.includes(value)) ?? false;
}

function excludesMotors(wayTags: ReadonlyMap<string, string>) {
  const motorAccess = effectiveMotorAccess(wayTags);
  const motorcarAllows = hasValue(wayTags, "motorcar", [
    "yes",
    "public",
    "permissive",
    "designated",
    "official",
    ...RESTRICTED_MOTOR_ACCESS,
  ]);

  return (
    !motorcarAllows &&
    motorAccess !== null &&
    motorAccess.every((value) => ["no", "private"].includes(value))
  );
}

function isMajorMotorRoad(wayTags: ReadonlyMap<string, string>) {
  return (
    !excludesMotors(wayTags) &&
    (MAJOR_HIGHWAYS.has(wayTags.get("highway") ?? "") ||
      wayTags.get("motorroad") === "yes")
  );
}

function exposureTier(wayTags: ReadonlyMap<string, string>): MotorExposureTier {
  const highway = wayTags.get("highway") ?? "";
  const motorAccess = effectiveMotorAccess(wayTags);
  const motorcarAllows = hasValue(wayTags, "motorcar", [
    "yes",
    "public",
    "permissive",
    "designated",
    "official",
    ...RESTRICTED_MOTOR_ACCESS,
  ]);
  const explicitlyAllowsMotors =
    motorcarAllows ||
    includesValue(motorAccess, [
      "yes",
      "public",
      "permissive",
      "designated",
      "official",
      ...RESTRICTED_MOTOR_ACCESS,
    ]);
  const motorsExcluded = excludesMotors(wayTags);
  const separatedCycleway =
    hasValue(wayTags, "cycleway", ["track", "separate"]) ||
    hasValue(wayTags, "cycleway:left", ["track", "sidepath"]) ||
    hasValue(wayTags, "cycleway:right", ["track", "sidepath"]) ||
    hasValue(wayTags, "cycleway:both", ["track", "sidepath"]);

  if (
    motorsExcluded ||
    separatedCycleway ||
    (NON_MOTOR_HIGHWAYS.has(highway) && !explicitlyAllowsMotors)
  ) {
    return "none";
  }

  const maximumSpeed = Number.parseFloat(wayTags.get("maxspeed") ?? "");
  const estimatedTrafficClass = Number.parseInt(
    wayTags.get("estimated_traffic_class") ?? "",
    10,
  );
  if (
    MAJOR_HIGHWAYS.has(highway) ||
    wayTags.get("motorroad") === "yes" ||
    maximumSpeed >= 60 ||
    estimatedTrafficClass >= 5
  ) {
    return "high";
  }

  if (
    highway === "service" &&
    (includesValue(motorAccess, RESTRICTED_MOTOR_ACCESS) ||
      hasValue(wayTags, "motorcar", RESTRICTED_MOTOR_ACCESS))
  ) {
    return "rare";
  }

  if (
    highway === "service" ||
    highway === "track" ||
    hasValue(wayTags, "designation", ["byway_open_to_all_traffic"]) ||
    hasValue(wayTags, "designation", ["quiet_lane"]) ||
    hasValue(wayTags, "quiet_lane", ["yes"]) ||
    (estimatedTrafficClass > 0 && estimatedTrafficClass <= 2)
  ) {
    return "low";
  }

  return "moderate";
}

function crossingAudit(
  incomingWayTags: ReadonlyMap<string, string>,
  nodeTags: ReadonlyMap<string, string>,
  outgoingWayTags: ReadonlyMap<string, string> | null,
): Pick<MotorTrafficAudit, "crossing" | "crossingPenalty"> {
  if (
    nodeTags.get("spokes_crossing_road_class") !== "major" ||
    outgoingWayTags === null ||
    isMajorMotorRoad(incomingWayTags) ||
    isMajorMotorRoad(outgoingWayTags)
  ) {
    return { crossing: "none", crossingPenalty: 0 };
  }

  if (
    hasValue(incomingWayTags, "bridge", ["yes", "true", "viaduct"]) ||
    hasValue(outgoingWayTags, "bridge", ["yes", "true", "viaduct"]) ||
    hasValue(incomingWayTags, "tunnel", [
      "yes",
      "building_passage",
      "passage",
      "culvert",
    ]) ||
    hasValue(outgoingWayTags, "tunnel", [
      "yes",
      "building_passage",
      "passage",
      "culvert",
    ])
  ) {
    return { crossing: "grade-separated", crossingPenalty: 0 };
  }

  if (
    hasValue(nodeTags, "crossing", [
      "marked",
      "pedestrian_signals",
      "traffic_signals",
      "zebra",
    ]) ||
    hasValue(nodeTags, "highway", ["traffic_signals"])
  ) {
    return { crossing: "controlled", crossingPenalty: 1 };
  }

  if (hasValue(nodeTags, "crossing", ["island"])) {
    return { crossing: "island", crossingPenalty: 2 };
  }

  return { crossing: "uncontrolled-major", crossingPenalty: 4 };
}

export function auditMotorTraffic(
  wayTags: ReadonlyMap<string, string>,
  nodeTags: ReadonlyMap<string, string>,
  outgoingWayTags: ReadonlyMap<string, string> | null = null,
): MotorTrafficAudit {
  const tier = exposureTier(wayTags);

  return {
    exposureTier: tier,
    ...crossingAudit(wayTags, nodeTags, outgoingWayTags),
  };
}
