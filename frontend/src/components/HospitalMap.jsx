import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../context/ThemeContext";

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ambulanceIcon = new L.DivIcon({
  html: '<div style="background:#dc2626;color:white;padding:6px 10px;border-radius:10px;font-size:20px;border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.35)">🚑</div>',
  className: "",
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

function FitBounds({ hospitals, userLocation, ambulanceRoute }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (userLocation?.lat) {
      points.push([userLocation.lat, userLocation.lng]);
    }
    hospitals.forEach((h) => {
      if (h.latitude && h.longitude) {
        points.push([h.latitude, h.longitude]);
      }
    });
    ambulanceRoute?.forEach((p) => points.push([p.lat, p.lng]));
    if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }
  }, [hospitals, userLocation, ambulanceRoute, map]);

  return null;
}

export function HospitalMap({
  hospitals = [],
  userLocation = null,
  height = "400px",
  selectedId = null,
  onSelect,
  className = "",
  ambulanceRoute = null,
  ambulancePosition = null,
  dispatchHospitalId = null,
}) {
  const { isDark } = useTheme();
  const center = userLocation?.lat
    ? [userLocation.lat, userLocation.lng]
    : hospitals[0]
      ? [hospitals[0].latitude, hospitals[0].longitude]
      : [20.5937, 78.9629];

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const routeCoords = ambulanceRoute?.map((p) => [p.lat, p.lng]) || [];

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
        />
        <FitBounds
          hospitals={hospitals}
          userLocation={userLocation}
          ambulanceRoute={ambulanceRoute}
        />

        {userLocation?.lat && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            {!ambulanceRoute && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={20000}
                pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.06 }}
              />
            )}
          </>
        )}

        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "#dc2626", weight: 5, opacity: 0.85, dashArray: "10 8" }}
          />
        )}

        {ambulancePosition?.lat && (
          <Marker position={[ambulancePosition.lat, ambulancePosition.lng]} icon={ambulanceIcon}>
            <Popup>Ambulance en route</Popup>
          </Marker>
        )}

        {hospitals.map((h) => (
          <Marker
            key={h._id || h.osmId}
            position={[h.latitude, h.longitude]}
            icon={hospitalIcon}
            eventHandlers={{
              click: () => onSelect?.(h),
            }}
            opacity={
              dispatchHospitalId && dispatchHospitalId !== h._id
                ? 0.45
                : selectedId && selectedId !== h._id
                  ? 0.6
                  : 1
            }
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs mt-1 opacity-80">{h.address}</p>
                <p className="text-xs opacity-80">{h.city}</p>
                {dispatchHospitalId === h._id && (
                  <p className="text-red-600 text-xs font-semibold mt-1">Ambulance dispatched from here</p>
                )}
                {h.distanceKm !== undefined && (
                  <p className="text-brand-600 text-xs font-medium mt-1">
                    {h.distanceKm.toFixed(1)} km away
                  </p>
                )}
                <p className="text-xs mt-1">
                  <span className="font-medium text-emerald-700">{h.availableBeds}</span>
                  <span> / {h.totalBeds} beds</span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
