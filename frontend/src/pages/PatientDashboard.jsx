import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Calendar,
  Building2,
  BedDouble,
  MapPin,
  Stethoscope,
  Loader2,
  Package,
  Search,
} from "lucide-react";
import { DashboardHeader } from "../components/DashboardHeader";
import { HospitalMap } from "../components/HospitalMap";
import { EmergencyModal } from "../components/EmergencyModal";
import { useNearbyHospitals } from "../hooks/useNearbyHospitals";
import { useEmergencyDispatch } from "../hooks/useEmergencyDispatch";

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

const statusBadge = {
  pending: "badge-pending",
  accepted: "badge-accepted",
  rejected: "badge-rejected",
};

function PatientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { location, locationLabel, hospitals, loading: hospitalsLoading, error: hospitalsError, refresh } =
    useNearbyHospitals();

  const [tab, setTab] = useState("appointments");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bedBookings, setBedBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    specialty: "", doctorId: "", date: "", timeSlot: "", reason: "",
  });
  const [bedForm, setBedForm] = useState({ hospitalId: "", date: "" });
  const [pharmacyQuery, setPharmacyQuery] = useState("");
  const [pharmacyHospitalId, setPharmacyHospitalId] = useState("");
  const [pharmacyResults, setPharmacyResults] = useState([]);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [message, setMessage] = useState("");
  const emergency = useEmergencyDispatch(location, setMessage);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const loadPatientData = async () => {
    try {
      const [specRes, apptRes, bedRes] = await Promise.all([
        api.get("/appointments/specialties"),
        api.get("/appointments/my"),
        api.get("/beds/my"),
      ]);
      setSpecialties(specRes.data);
      setAppointments(apptRes.data);
      setBedBookings(bedRes.data);
    } catch {
      setMessage("Failed to load data. Is the server running?");
    }
  };

  useEffect(() => {
    loadPatientData();
  }, []);

  useEffect(() => {
    if (bookingForm.specialty) {
      api
        .get("/appointments/doctors", { params: { specialty: bookingForm.specialty } })
        .then((res) => setDoctors(res.data));
    } else {
      setDoctors([]);
    }
  }, [bookingForm.specialty]);

  const bookAppointment = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/appointments", bookingForm);
      setBookingForm({ specialty: "", doctorId: "", date: "", timeSlot: "", reason: "" });
      setMessage("Appointment booked! Waiting for doctor approval.");
      loadPatientData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  const bookBed = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/beds", bedForm);
      setBedForm({ hospitalId: "", date: "" });
      setMessage("Bed booked successfully!");
      loadPatientData();
      refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || "Bed booking failed");
    }
  };

  const searchPharmacy = async (e) => {
    e.preventDefault();
    setPharmacyLoading(true);
    setMessage("");
    try {
      const res = await api.get("/medicines/search", {
        params: {
          q: pharmacyQuery || undefined,
          hospitalId: pharmacyHospitalId || undefined,
        },
      });
      setPharmacyResults(res.data);
    } catch {
      setMessage("Failed to search medicines.");
    } finally {
      setPharmacyLoading(false);
    }
  };

  const tabs = [
    { id: "appointments", label: "Book Appointment", icon: Calendar },
    { id: "hospitals", label: "Nearby Hospitals", icon: Building2 },
    { id: "beds", label: "Book a Bed", icon: BedDouble },
    { id: "pharmacy", label: "Pharmacy", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <DashboardHeader
        user={user}
        portalLabel="Patient Portal"
        onLogout={logout}
        onEmergency={emergency.requestAmbulance}
        emergencyLoading={emergency.loading}
      />
      <EmergencyModal
        dispatch={emergency.dispatch}
        location={location}
        ambulancePosition={emergency.ambulancePosition}
        progress={emergency.progress}
        arrived={emergency.arrived}
        onClose={emergency.closeTracking}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {message && <div className="alert-info mb-6">{message}</div>}

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === id ? "tab-active" : "tab-inactive"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "appointments" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Stethoscope className="w-5 h-5 text-brand-600" />
                Book with a Doctor
              </h2>
              <form onSubmit={bookAppointment} className="space-y-4">
                <select
                  required
                  value={bookingForm.specialty}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, specialty: e.target.value, doctorId: "" })
                  }
                  className="input-field"
                >
                  <option value="">Select doctor type</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  required
                  value={bookingForm.doctorId}
                  onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                  className="input-field"
                  disabled={!bookingForm.specialty}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name} — {d.hospital?.name}
                    </option>
                  ))}
                </select>
                <input type="date" required min={new Date().toISOString().split("T")[0]}
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  className="input-field"
                />
                <select required value={bookingForm.timeSlot}
                  onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select time slot</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <textarea placeholder="Reason for visit (optional)" value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  className="input-field h-24 resize-none"
                />
                <button type="submit" className="btn-primary w-full">Book Appointment</button>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">My Appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-text-muted text-sm">No appointments yet.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((a) => (
                    <div key={a._id} className="p-4 rounded-xl border border-border bg-bg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">Dr. {a.doctor?.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadge[a.status]}`}>
                          {a.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">{a.specialty}</p>
                      <p className="text-sm text-text-muted">{a.date} at {a.timeSlot}</p>
                      <p className="text-xs text-slate-400 mt-1">{a.hospital?.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "hospitals" && (
          <div>
            <div className="flex items-center gap-2 mb-6 text-sm text-text-muted">
              <MapPin className="w-4 h-4 text-brand-600" />
              {locationLabel}
            </div>

            {hospitalsLoading ? (
              <div className="flex items-center justify-center gap-3 py-20 text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                <span>Loading real hospitals from OpenStreetMap...</span>
              </div>
            ) : hospitalsError ? (
              <div className="alert-error">{hospitalsError}</div>
            ) : (
              <>
                <HospitalMap
                  hospitals={hospitals}
                  userLocation={location}
                  selectedId={selectedHospital?._id}
                  onSelect={setSelectedHospital}
                  height="380px"
                  className="mb-6"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  {hospitals.map((h) => (
                    <div
                      key={h._id}
                      onClick={() => setSelectedHospital(h)}
                      className={`card p-6 cursor-pointer transition hover:border-brand-200 ${
                        selectedHospital?._id === h._id ? "ring-2 ring-brand-500 border-brand-200" : ""
                      }`}
                    >
                      <h3 className="font-semibold text-lg text-slate-800">{h.name}</h3>
                      <p className="text-sm text-text-muted mt-1">{h.address}, {h.city}</p>
                      {h.distanceKm !== undefined && (
                        <p className="text-sm text-brand-600 mt-2 font-medium">
                          {h.distanceKm.toFixed(1)} km away
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-brand-600" />
                        <span className="text-sm">
                          <span className="font-semibold text-brand-700">{h.availableBeds}</span>
                          <span className="text-text-muted"> / {h.totalBeds} beds available</span>
                        </span>
                      </div>
                      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${(h.availableBeds / h.totalBeds) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "beds" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">Book a Hospital Bed</h2>
              <form onSubmit={bookBed} className="space-y-4">
                <select required value={bedForm.hospitalId}
                  onChange={(e) => setBedForm({ ...bedForm, hospitalId: e.target.value })}
                  className="input-field"
                  disabled={hospitalsLoading}
                >
                  <option value="">
                    {hospitalsLoading ? "Loading hospitals..." : "Select hospital"}
                  </option>
                  {hospitals.filter((h) => h.availableBeds > 0).map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} — {h.availableBeds} beds free
                    </option>
                  ))}
                </select>
                <input type="date" required min={new Date().toISOString().split("T")[0]}
                  value={bedForm.date}
                  onChange={(e) => setBedForm({ ...bedForm, date: e.target.value })}
                  className="input-field"
                />
                <button type="submit" className="btn-primary w-full">Book Bed</button>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">My Bed Bookings</h2>
              {bedBookings.length === 0 ? (
                <p className="text-text-muted text-sm">No bed bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bedBookings.map((b) => (
                    <div key={b._id} className="p-4 rounded-xl border border-border bg-bg">
                      <p className="font-medium">{b.hospital?.name}</p>
                      <p className="text-sm text-text-muted">{b.hospital?.city}</p>
                      <p className="text-sm text-text-muted mt-1">Date: {b.date}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full badge-accepted capitalize">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "pharmacy" && (
          <div>
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Package className="w-5 h-5 text-brand-600" />
                Search Medicine Availability
              </h2>
              <form onSubmit={searchPharmacy} className="grid md:grid-cols-[1fr_1fr_auto] gap-4">
                <input
                  type="text"
                  placeholder="Medicine name (e.g. Paracetamol)"
                  value={pharmacyQuery}
                  onChange={(e) => setPharmacyQuery(e.target.value)}
                  className="input-field"
                />
                <select
                  value={pharmacyHospitalId}
                  onChange={(e) => setPharmacyHospitalId(e.target.value)}
                  className="input-field"
                  disabled={hospitalsLoading}
                >
                  <option value="">All nearby hospitals</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={pharmacyLoading}>
                  {pharmacyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </button>
              </form>
            </div>

            {pharmacyResults.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-12">
                Search for medicines to see availability at nearby hospitals.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {pharmacyResults.map((m) => (
                  <div key={m._id} className="card p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{m.name}</p>
                        <p className="text-sm text-text-muted mt-1">
                          {m.hospital?.name} · {m.hospital?.city}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        {m.quantity} {m.unit}
                      </span>
                    </div>
                    {m.quantity <= m.minStock && (
                      <p className="text-xs text-amber-600 mt-3">Limited stock — contact hospital to confirm</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
