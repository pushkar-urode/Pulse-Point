import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

const DEFAULT_LOCATION = { lat: 19.076, lng: 72.8777 };

export function useNearbyHospitals() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationLabel, setLocationLabel] = useState("Detecting your location...");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospitals = useCallback(async (coords) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/hospitals", {
        params: { lat: coords.lat, lng: coords.lng, radius: 20000 },
      });
      setHospitals(res.data);
      if (res.data.length === 0) {
        setError("No hospitals found within 20 km. Try a different area.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load nearby hospitals.");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLabel("Using default location (Mumbai)");
      fetchHospitals(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        setLocationLabel("Showing hospitals near you");
        fetchHospitals(coords);
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        setLocationLabel("Location denied — showing Mumbai hospitals");
        fetchHospitals(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchHospitals]);

  const refresh = () => fetchHospitals(location);

  return { location, locationLabel, hospitals, loading, error, refresh };
}
