"use client";

import IndonesiaMap from "./IndonesiaMap";
import Image from "next/image";

type CityStat = {
  city: string;
  count: number;
  percent: number;
};

type MapMarker = {
  latLng: [number, number];
  name: string;
};

type DemographicCardProps = {
  cities?: CityStat[];
  markers?: MapMarker[];
  total?: number;
  loading?: boolean;
};

export default function DemographicCard({
  cities = [],
  markers = [],
  total = 0,
  loading = false,
}: DemographicCardProps) {
  const safeCities = Array.isArray(cities) ? cities : [];
  const topCities = safeCities.slice(0, 6);
  const safeMarkers = Array.isArray(markers) ? markers : [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Patients Location
            </h3>
            
          </div>
          <p className="text-gray-500 text-theme-sm dark:text-gray-400">
            City base distribution consultations
          </p>
        </div>

        <div>
          <div className="text-sm flex items-center justify-end gap-x-1 text-gray-500 dark:text-gray-400">
            <div className="w-3 h-3 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <Image
                src="/static/indonesia.jpeg"
                className="w-full h-full object-cover object-center"
                width={16}
                height={16}
                alt="Indonesia"
              />
            </div>
            <p className="mb-0.5">🇮🇩</p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-1 items-center justify-end">
            <span className="font-semibold text-gray-800 dark:text-white/90">{total}</span> Patients
          </div>
        </div>
        
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-[220px] w-full">
          <IndonesiaMap markers={safeMarkers} />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading demographic...
          </div>
        ) : topCities.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Belum ada data lokasi.
          </div>
        ) : (
          topCities.map((item) => (
            <div key={item.city} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p
                  className="font-semibold text-gray-800 text-theme-sm dark:text-white/90 truncate"
                  title={item.city}
                >
                  {item.city}
                </p>
                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                  {item.count} konsultasi
                </span>
              </div>

              <div className="flex w-full max-w-[180px] items-center gap-3">
                <div className="relative block h-2 w-full rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div
                    className="absolute left-0 top-0 h-full rounded-sm bg-brand-500"
                    style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                  />
                </div>
                <p className="min-w-[40px] text-right text-gray-800 text-theme-xs font-medium dark:text-white/90">
                  {Math.round(item.percent)}%
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
