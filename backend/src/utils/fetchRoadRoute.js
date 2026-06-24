const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

const buildStraightRoute = (fromLat, fromLng, toLat, toLng, steps = 24) => {
  const route = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    route.push({
      lat: fromLat + (toLat - fromLat) * t,
      lng: fromLng + (toLng - fromLng) * t,
    });
  }
  return route;
};

const fetchRoadRoute = async (fromLat, fromLng, toLat, toLng) => {
  const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  const response = await fetch(url, {
    headers: { "User-Agent": "PulsePointHospitalApp/1.0" },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error("Road routing service unavailable");
  }

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error("No road route found");
  }

  const route = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({
    lat,
    lng,
  }));

  return {
    route,
    distanceKm: Number((data.routes[0].distance / 1000).toFixed(2)),
    etaMinutes: Math.max(3, Math.ceil(data.routes[0].duration / 60)),
  };
};

module.exports = { fetchRoadRoute, buildStraightRoute };
