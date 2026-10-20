"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Camera, UserRound } from "lucide-react";

type Profile = {
  id: number;
  nama: string;
  email: string;
  role: string;
  kelas_id: number | null;
  foto_profil: string | null;
  created_at: string;
};
export default function ProfileForm() {
  const [data, setData] = useState<Profile | null>(null);
  const [nama, setNama] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    api<{ data: Profile }>("/profile")
      .then((r) => {
        setData(r.data);
        setNama(r.data.nama);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Gagal mengambil profil"),
      )
      .finally(() => setLoading(false));
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const body = new FormData();
      body.append("nama", nama);
      if (foto) body.append("foto", foto);
      const r = await api<{ data: Profile; message: string }>("/profile", {
        method: "PATCH",
        body,
      });
      setData(r.data);
      setNama(r.data.nama);
      setFoto(null);
      setSuccess(r.message || "Profil berhasil diperbarui");
      localStorage.setItem(
        "sims_user",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("sims_user") || "{}"),
          ...r.data,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memperbarui profil");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <div className="empty">Memuat profil...</div>;
  if (!data)
    return <div className="alert">{error || "Profil tidak ditemukan"}</div>;
  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Profil Saya</h2>
          <p className="muted" style={{ fontSize: 13 }}>
            Ubah nama dan foto profil akun kamu.
          </p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <div className="profile-layout">
        <div className="panel profile-summary">
          <div
            className="avatar"
            style={{ width: 92, height: 92, margin: "0 auto 15px" }}
          >
            {data.foto_profil ? (
              <img src={data.foto_profil} alt="Foto profil" />
            ) : (
              <UserRound size={36} />
            )}
          </div>
          <h3>{data.nama}</h3>
          <p className="muted" style={{ fontSize: 13 }}>
            {data.email}
          </p>
          <span className="badge">{data.role}</span>
          <p className="muted" style={{ fontSize: 12, marginTop: 18 }}>
            ID Pengguna: {data.id}
          </p>
          {data.kelas_id && (
            <p className="muted" style={{ fontSize: 12 }}>
              ID Kelas: {data.kelas_id}
            </p>
          )}
        </div>
        <form className="panel" onSubmit={submit}>
          <h3 style={{ marginTop: 0 }}>Informasi Akun</h3>
          <div className="field">
            <label>Nama lengkap</label>
            <input
              required
              minLength={3}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Email (tidak dapat diubah dari halaman profil)</label>
            <input disabled value={data.email} />
          </div>
          <div className="field">
            <label>Foto profil (opsional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
            />
          </div>
          <button className="btn" disabled={busy}>
            <Camera size={15} />
            {busy ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
