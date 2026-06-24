import { useEffect, useState } from "react";
import api from "../services/api";

const ANIMATION_MS = 20000;

const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const getPositionAlongRoute = (route, t) => {
  if (!route?.length) return null;
  if (t <= 0) return route[0];
  if (t >= 1) return route[route.length - 1];

  const segments = [];
  let total = 0;
  for (let i = 0; i < route.length - 1; i += 1) {
    const dist = haversineKm(route[i], route[i + 1]);
    segments.push(dist);
    total += dist;
  }

  if (total === 0) return route[route.length - 1];

  const target = t * total;
  let covered = 0;

  for (let i = 0; i < segments.length; i += 1) {
    if (covered + segments[i] >= target) {
      const segT = (target - covered) / segments[i];
      return {
        lat: route[i].lat + (route[i + 1].lat - route[i].lat) * segT,
        lng: route[i].lng + (route[i + 1].lng - route[i].lng) * segT,
      };
    }
    covered += segments[i];
  }

  return route[route.length - 1];
};

export function useEmergencyDispatch(location, onMessage) {
  const [dispatch, setDispatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ambulancePosition, setAmbulancePosition] = useState(null);
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!dispatch?.route?.length) return undefined;

    const route = dispatch.route;
    setAmbulancePosition(route[0]);
    setProgress(0);
    setArrived(false);

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const t = Math.min(1, (Date.now() - startedAt) / ANIMATION_MS);
      const point = getPositionAlongRoute(route, t);
      setAmbulancePosition(point);
      setProgress(Math.round(t * 100));

      if (t >= 1) {
        clearInterval(interval);
        setArrived(true);
        onMessage?.("Ambulance has arrived at your location. Help is on the way.");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [dispatch]);

  const requestAmbulance = async () => {
    if (!location?.lat) {
      onMessage?.("Unable to detect your location. Enable GPS and try again.");
      return;
    }

    const confirmed = window.confirm(
      "Request an emergency ambulance to your current location?\n\nOnly use this in a real emergency."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await api.post("/emergency/dispatch", {
        lat: location.lat,
        lng: location.lng,
      });
      setDispatch(res.data);
      onMessage?.(
        `Ambulance ${res.data.ambulanceId} dispatched from ${res.data.hospital.name}. ETA ~${res.data.etaMinutes} min.`
      );
    } catch (err) {
      onMessage?.(err.response?.data?.message || "Emergency dispatch failed.");
    } finally {
      setLoading(false);
    }
  };

  const closeTracking = () => {
    setDispatch(null);
    setAmbulancePosition(null);
    setProgress(0);
    setArrived(false);
  };

  return {
    dispatch,
    loading,
    ambulancePosition,
    progress,
    arrived,
    requestAmbulance,
    closeTracking,
  };
}
