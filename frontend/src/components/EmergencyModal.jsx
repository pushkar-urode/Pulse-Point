import { AlertTriangle, Loader2, Phone, X } from "lucide-react";
import { HospitalMap } from "./HospitalMap";

export function EmergencyModal({
  dispatch,
  location,
  ambulancePosition,
  progress,
  arrived,
  onClose,
}) {
  if (!dispatch) return null;

  const hospitals = dispatch.hospital ? [dispatch.hospital] : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-danger flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Emergency Ambulance {arrived ? "Arrived" : "En Route"}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              ID: {dispatch.ambulanceId} · From {dispatch.hospital.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-danger transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-bg border border-border">
            <p className="text-xs text-text-muted">Road distance</p>
            <p className="font-semibold">{dispatch.distanceKm} km</p>
          </div>
          <div className="p-3 rounded-xl bg-bg border border-border">
            <p className="text-xs text-text-muted">ETA</p>
            <p className="font-semibold">{arrived ? "Arrived" : `~${dispatch.etaMinutes} min`}</p>
          </div>
          <div className="p-3 rounded-xl bg-bg border border-border">
            <p className="text-xs text-text-muted">Progress</p>
            <p className="font-semibold">{progress}%</p>
          </div>
        </div>

        <HospitalMap
          hospitals={hospitals}
          userLocation={location}
          ambulanceRoute={dispatch.route}
          ambulancePosition={ambulancePosition}
          dispatchHospitalId={dispatch.hospital._id}
          height="360px"
          className="mb-4"
        />

        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-red-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-text-muted">
            {arrived
              ? "Ambulance has reached your location."
              : dispatch.followsRoads
                ? "Ambulance is following road routes to your location."
                : "Ambulance is en route to your location."}
          </p>
          {dispatch.hospital.phone && (
            <a
              href={`tel:${dispatch.hospital.phone}`}
              className="inline-flex items-center gap-2 text-brand-600 font-medium"
            >
              <Phone className="w-4 h-4" />
              Call hospital
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
