import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { AuthLayout } from "../components/AuthLayout";
import { useNearbyHospitals } from "../hooks/useNearbyHospitals";

function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const isDoctor = role === "doctor";
  const { hospitals, loading: hospitalsLoading } = useNearbyHospitals();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    hospital: "",
  });
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isDoctor) {
      api.get("/appointments/specialties").then((res) => setSpecialties(res.data));
    }
  }, [isDoctor]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        specialty: isDoctor ? form.specialty : undefined,
        hospital: isDoctor ? form.hospital : undefined,
      });
      navigate(`/login/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      role={role}
      title={isDoctor ? "Doctor Registration" : "Patient Registration"}
      subtitle="Create your Pulse Point account"
    >
      {error && <div className="alert-error mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          required
          value={form.name}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          required
          value={form.email}
          onChange={handleChange}
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          value={form.password}
          onChange={handleChange}
          className="input-field"
        />

        {isDoctor && (
          <>
            <select
              name="specialty"
              required
              value={form.specialty}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select specialty</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              name="hospital"
              required
              value={form.hospital}
              onChange={handleChange}
              className="input-field"
              disabled={hospitalsLoading}
            >
              <option value="">
                {hospitalsLoading
                  ? "Loading real hospitals near you..."
                  : "Select hospital"}
              </option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} — {h.city} ({h.distanceKm?.toFixed(1)} km)
                </option>
              ))}
            </select>
          </>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{" "}
        <Link to={`/login/${role}`} className="font-medium text-brand-600">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
