"use client";

import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef } from "react";

import type { Coordinate, RoutePlanningResponse } from "@/lib/route-planning";

export type SelectedEndpoints = {
  start: Coordinate | null;
  destination: Coordinate | null;
};

type RouteMapProps = {
  endpoints: SelectedEndpoints;
  response: RoutePlanningResponse | null;
  onSelect: (coordinate: Coordinate) => void;
};

const INITIAL_CENTER: [longitude: number, latitude: number] = [-0.22, 51.82];
const MAP_TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

function clearRoute(map: MapLibreMap) {
  const emptyData = { type: "FeatureCollection" as const, features: [] };
  (map.getSource("route-plan") as GeoJSONSource | undefined)?.setData(emptyData);
  (map.getSource("endpoint-connectors") as GeoJSONSource | undefined)?.setData(emptyData);
}

function renderRoute(map: MapLibreMap, response: RoutePlanningResponse) {
  const route = response.routes[0];
  const routeData = {
    type: "Feature" as const,
    properties: {},
    geometry: route.geometry,
  };
  const connectorData = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [route.requestedCoordinates.start.longitude, route.requestedCoordinates.start.latitude],
            [route.snappedCoordinates.start.longitude, route.snappedCoordinates.start.latitude],
          ],
        },
      },
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [
              route.requestedCoordinates.destination.longitude,
              route.requestedCoordinates.destination.latitude,
            ],
            [
              route.snappedCoordinates.destination.longitude,
              route.snappedCoordinates.destination.latitude,
            ],
          ],
        },
      },
    ],
  };

  const routeSource = map.getSource("route-plan") as GeoJSONSource | undefined;
  if (routeSource) {
    routeSource.setData(routeData);
  } else {
    map.addSource("route-plan", { type: "geojson", data: routeData });
    map.addLayer({
      id: "route-plan-shadow",
      type: "line",
      source: "route-plan",
      paint: { "line-color": "#fffdf8", "line-width": 11 },
    });
    map.addLayer({
      id: "route-plan-line",
      type: "line",
      source: "route-plan",
      paint: { "line-color": "#1f6848", "line-width": 6 },
    });
  }

  const connectorSource = map.getSource("endpoint-connectors") as GeoJSONSource | undefined;
  if (connectorSource) {
    connectorSource.setData(connectorData);
  } else {
    map.addSource("endpoint-connectors", { type: "geojson", data: connectorData });
    map.addLayer({
      id: "endpoint-connectors",
      type: "line",
      source: "endpoint-connectors",
      paint: { "line-color": "#805b37", "line-width": 3, "line-dasharray": [1.5, 1.5] },
    });
  }

  const bounds = new maplibregl.LngLatBounds();
  route.geometry.coordinates.forEach((coordinate) => bounds.extend(coordinate));
  bounds.extend([
    route.requestedCoordinates.start.longitude,
    route.requestedCoordinates.start.latitude,
  ]);
  bounds.extend([
    route.requestedCoordinates.destination.longitude,
    route.requestedCoordinates.destination.latitude,
  ]);
  map.fitBounds(bounds, { padding: 72, maxZoom: 14, duration: 700 });
}

export function RouteMap({ endpoints, response, onSelect }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: INITIAL_CENTER,
      zoom: 10,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: "raster",
            tiles: [MAP_TILE_URL],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "basemap", type: "raster", source: "basemap" }],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("click", ({ lngLat }) => {
      onSelectRef.current({ latitude: lngLat.lat, longitude: lngLat.lng });
    });
    mapRef.current = map;

    return () => {
      markerRef.current.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current.forEach((marker) => marker.remove());
    markerRef.current = [];

    if (endpoints.start) {
      markerRef.current.push(
        new maplibregl.Marker({ color: "#46bd7b" })
          .setLngLat([endpoints.start.longitude, endpoints.start.latitude])
          .setPopup(new maplibregl.Popup({ offset: 24 }).setText("Requested start"))
          .addTo(map),
      );
    }
    if (endpoints.destination) {
      markerRef.current.push(
        new maplibregl.Marker({ color: "#18231e" })
          .setLngLat([endpoints.destination.longitude, endpoints.destination.latitude])
          .setPopup(new maplibregl.Popup({ offset: 24 }).setText("Requested destination"))
          .addTo(map),
      );
    }
  }, [endpoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => (response ? renderRoute(map, response) : clearRoute(map));
    if (map.isStyleLoaded()) update();
    else map.once("load", update);
  }, [response]);

  return <div ref={containerRef} className="map" aria-label="Map for selecting route endpoints" />;
}
