const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const USER_AGENT = "PulsePointHospitalApp/1.0";

const buildAddress = (tags) => {
  const street = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  if (street) return street;
  if (tags["addr:full"]) return tags["addr:full"];
  if (tags["addr:place"]) return tags["addr:place"];
  return "Address not listed";
};

const getCity = (tags) =>
  tags["addr:city"] ||
  tags["addr:town"] ||
  tags["addr:village"] ||
  tags["addr:suburb"] ||
  tags["addr:county"] ||
  tags["addr:state"] ||
  "Unknown";

const MIN_TOTAL_BEDS = 50;
const MAX_TOTAL_BEDS = 500;

const normalizeTotalBeds = (raw, osmId) => {
  const parsed = parseInt(raw, 10);
  if (!Number.isNaN(parsed) && parsed >= MIN_TOTAL_BEDS) {
    return Math.min(parsed, MAX_TOTAL_BEDS);
  }

  const hash = String(osmId)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MIN_TOTAL_BEDS + (hash % 151);
};

const estimateAvailableBeds = (totalBeds, osmId) =>
  Math.max(5, Math.floor(totalBeds * (0.25 + (String(osmId).length % 5) * 0.05)));

const estimateBeds = (tags, osmId) => {
  const fromTag = tags["capacity:beds"] || tags.beds || tags["bed:count"];
  return normalizeTotalBeds(fromTag, osmId);
};

const parseOverpassElement = (element) => {
  const tags = element.tags || {};
  if (!tags.name) return null;

  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (!lat || !lon) return null;

  const osmId = `${element.type}/${element.id}`;
  const totalBeds = estimateBeds(tags, osmId);

  return {
    osmId,
    name: tags.name,
    address: buildAddress(tags),
    city: getCity(tags),
    latitude: lat,
    longitude: lon,
    totalBeds,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    emergency: tags.emergency === "yes" || tags.healthcare === "hospital",
  };
};

const parseNominatimResult = (item) => {
  if (!item.display_name && !item.name) return null;

  const osmId = `${item.osm_type}/${item.osm_id}`;
  const tags = item.extratags || {};
  const address = item.address || {};
  const totalBeds = estimateBeds(tags, osmId);

  const street = [address.house_number, address.road].filter(Boolean).join(" ");

  return {
    osmId,
    name: item.name || item.display_name.split(",")[0],
    address: street || item.display_name.split(",").slice(0, 2).join(", "),
    city:
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.state ||
      "Unknown",
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    totalBeds,
    phone: tags.phone || null,
    website: tags.website || null,
    emergency: tags.emergency === "yes",
  };
};

const fetchFromOverpass = async (lat, lng, radiusM) => {
  const query = `
    [out:json][timeout:45];
    (
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      way["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusM},${lat},${lng});
      way["healthcare"="hospital"](around:${radiusM},${lat},${lng});
    );
    out center 40 tags;
  `;

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetch(server, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(55000),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const seen = new Set();
      const hospitals = [];

      for (const element of data.elements || []) {
        const parsed = parseOverpassElement(element);
        if (!parsed || seen.has(parsed.osmId)) continue;
        seen.add(parsed.osmId);
        hospitals.push(parsed);
      }

      if (hospitals.length > 0) return hospitals;
    } catch {
      continue;
    }
  }

  return null;
};

const fetchFromNominatim = async (lat, lng, radiusM) => {
  const delta = radiusM / 111000;
  const viewbox = [
    lng - delta,
    lat + delta,
    lng + delta,
    lat - delta,
  ].join(",");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", "hospital");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "50");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("viewbox", viewbox);
  url.searchParams.set("bounded", "1");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch hospitals from OpenStreetMap");
  }

  const data = await response.json();
  const seen = new Set();
  const hospitals = [];

  for (const item of data) {
    const parsed = parseNominatimResult(item);
    if (!parsed || seen.has(parsed.osmId)) continue;
    seen.add(parsed.osmId);
    hospitals.push(parsed);
  }

  return hospitals;
};

const fetchRealHospitals = async (lat, lng, radiusM = 20000) => {
  const overpass = await fetchFromOverpass(lat, lng, radiusM);
  if (overpass && overpass.length > 0) return overpass;

  const nominatim = await fetchFromNominatim(lat, lng, radiusM);
  if (nominatim.length > 0) return nominatim;

  throw new Error("No hospitals found nearby. Try enabling location or a different area.");
};

module.exports = {
  fetchRealHospitals,
  normalizeTotalBeds,
  estimateAvailableBeds,
  MIN_TOTAL_BEDS,
};
