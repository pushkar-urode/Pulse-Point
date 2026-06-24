import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Calendar, BedDouble, Package, Check, X, Plus, Trash2 } from "lucide-react";
import { DashboardHeader } from "../components/DashboardHeader";

const statusBadge = {
  pending: "badge-pending",
  accepted: "badge-accepted",
  rejected: "badge-rejected",
};

function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [bedCount, setBedCount] = useState("");
  const [totalBeds, setTotalBeds] = useState("");
  const [medForm, setMedForm] = useState({ name: "", quantity: "", unit: "units", minStock: "10" });
  const [message, setMessage] = useState("");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const loadData = async () => {
    try {
      const [apptRes, medRes] = await Promise.all([
        api.get("/appointments/doctor"),
        api.get("/medicines"),
      ]);
      setAppointments(apptRes.data);
      setMedicines(medRes.data);

      if (user.hospital) {
        const hospRes = await api.get(`/hospitals/${user.hospital}`);
        setHospital(hospRes.data);
        setBedCount(String(hospRes.data.availableBeds));
        setTotalBeds(String(hospRes.data.totalBeds));
      }
    } catch {
      setMessage("Failed to load data. Is the server running?");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setMessage(`Appointment ${status}.`);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  const updateBeds = async (e) => {
    e.preventDefault();
    if (!hospital) return;
    try {
      await api.patch(`/hospitals/${hospital._id}/beds`, {
        availableBeds: parseInt(bedCount, 10),
        totalBeds: parseInt(totalBeds, 10),
      });
      setMessage("Bed status updated.");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  const addMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post("/medicines", {
        name: medForm.name,
        quantity: parseInt(medForm.quantity, 10),
        unit: medForm.unit,
        minStock: parseInt(medForm.minStock, 10),
      });
      setMedForm({ name: "", quantity: "", unit: "units", minStock: "10" });
      setMessage("Medicine added.");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add medicine");
    }
  };

  const updateMedicineQty = async (id, quantity) => {
    try {
      await api.put(`/medicines/${id}`, { quantity: parseInt(quantity, 10) });
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  const deleteMedicine = async (id) => {
    try {
      await api.delete(`/medicines/${id}`);
      setMessage("Medicine removed.");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  const tabs = [
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "beds", label: "Bed Status", icon: BedDouble },
    { id: "inventory", label: "Medicine Inventory", icon: Package },
  ];

  const pending = appointments.filter((a) => a.status === "pending");

  return (
    <div className="min-h-screen bg-bg">
      <DashboardHeader
        user={{ name: `Dr. ${user.name}${user.specialty ? ` · ${user.specialty}` : ""}` }}
        portalLabel="Doctor Portal"
        onLogout={logout}
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
              {id === "appointments" && pending.length > 0 && (
                <span className="ml-1 bg-amber-400 text-amber-900 text-xs px-1.5 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "appointments" && (
          <div className="space-y-6">
            {pending.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-slate-800">
                  Pending Requests ({pending.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {pending.map((a) => (
                    <div key={a._id} className="card p-5 border-2 border-amber-200">
                      <p className="font-semibold">{a.patient?.name}</p>
                      <p className="text-sm text-text-muted">{a.patient?.email}</p>
                      <p className="text-sm mt-2">{a.date} at {a.timeSlot}</p>
                      {a.reason && (
                        <p className="text-sm text-text-muted mt-1 italic">&quot;{a.reason}&quot;</p>
                      )}
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => updateStatus(a._id, "accepted")}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-xl text-sm hover:bg-emerald-700">
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button onClick={() => updateStatus(a._id, "rejected")}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-xl text-sm hover:bg-red-700">
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-4 text-slate-800">All Appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-text-muted text-sm">No appointments yet.</p>
              ) : (
                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-bg border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-medium">Patient</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Time</th>
                        <th className="text-left p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a._id} className="border-b border-border">
                          <td className="p-4">{a.patient?.name}</td>
                          <td className="p-4">{a.date}</td>
                          <td className="p-4">{a.timeSlot}</td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadge[a.status]}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "beds" && (
          <div className="max-w-lg">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-2 text-heading">Manage Bed Availability</h2>
              {hospital ? (
                <>
                  <p className="text-sm text-text-muted mb-6">
                    {hospital.name}
                  </p>
                  <form onSubmit={updateBeds} className="space-y-4">
                    <div>
                      <label className="text-sm text-text-muted block mb-2">Total bed capacity</label>
                      <input type="number" min="10" max="1000" required
                        value={totalBeds} onChange={(e) => setTotalBeds(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-text-muted block mb-2">Available beds</label>
                      <input type="number" min="0" max={totalBeds || hospital.totalBeds} required
                        value={bedCount} onChange={(e) => setBedCount(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all"
                        style={{
                          width: `${(parseInt(bedCount || 0, 10) / parseInt(totalBeds || hospital.totalBeds || 1, 10)) * 100}%`,
                        }}
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full">Update Bed Status</button>
                  </form>
                </>
              ) : (
                <p className="text-text-muted text-sm">No hospital assigned to your account.</p>
              )}
            </div>
          </div>
        )}

        {tab === "inventory" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Plus className="w-5 h-5 text-brand-600" /> Add Medicine
              </h2>
              <form onSubmit={addMedicine} className="space-y-4">
                <input type="text" placeholder="Medicine name" required value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Quantity" required min="0" value={medForm.quantity}
                    onChange={(e) => setMedForm({ ...medForm, quantity: e.target.value })}
                    className="input-field"
                  />
                  <input type="text" placeholder="Unit" value={medForm.unit}
                    onChange={(e) => setMedForm({ ...medForm, unit: e.target.value })}
                    className="input-field"
                  />
                </div>
                <input type="number" placeholder="Minimum stock alert" min="0" value={medForm.minStock}
                  onChange={(e) => setMedForm({ ...medForm, minStock: e.target.value })}
                  className="input-field"
                />
                <button type="submit" className="btn-primary w-full">Add to Inventory</button>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">Hospital Inventory</h2>
              {medicines.length === 0 ? (
                <p className="text-text-muted text-sm">No medicines in inventory.</p>
              ) : (
                <div className="space-y-3">
                  {medicines.map((m) => (
                    <div key={m._id}
                      className={`p-4 rounded-xl border ${
                        m.quantity <= m.minStock ? "border-red-200 bg-red-50" : "border-border bg-bg"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{m.name}</p>
                          {m.quantity <= m.minStock && (
                            <p className="text-xs text-red-600 mt-1">Low stock!</p>
                          )}
                        </div>
                        <button onClick={() => deleteMedicine(m._id)}
                          className="text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <input type="number" min="0" defaultValue={m.quantity}
                          onBlur={(e) => updateMedicineQty(m._id, e.target.value)}
                          className="w-24 input-field py-2 text-sm"
                        />
                        <span className="text-sm text-text-muted">{m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
