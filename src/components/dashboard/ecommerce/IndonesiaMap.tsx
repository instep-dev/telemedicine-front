"use client";

import React from "react";
import { worldMill } from "@react-jvectormap/world";
import dynamic from "next/dynamic";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

type Marker = {
  latLng: [number, number];
  name: string;
  style?: {
    fill?: string;
    borderWidth?: number;
    borderColor?: string;
    r?: number;
  };
};

type IndonesiaMapProps = {
  markers?: Marker[];
  mapColor?: string;
};

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ markers = [], mapColor }) => {
  const markerKey =
    markers.length === 0
      ? "no-markers"
      : markers.map((m) => m.latLng.join(",")).join("|");

  return (
    <VectorMap
      key={markerKey}
      map={worldMill}
      backgroundColor="transparent"
      focusOn={{
        lat: -2,
        lng: 118,
        scale: 8.5,
        x: 0,
        y: 0,
        animate: true,
      }}
      zoomOnScroll={false}
      zoomMax={10}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      markersSelectable={false}
      markers={markers}
      markerStyle={{
        initial: {
          fill: "#465FFF",
          r: 4,
        },
      }}
      regionStyle={{
        initial: {
          fill: mapColor || "#D0D5DD",
          fillOpacity: 1,
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
          stroke: "none",
        },
        selected: {
          fill: "#465FFF",
        },
        selectedHover: {},
      }}
      selectedRegions={["ID"]}
    />
  );
};

export default IndonesiaMap;
