"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

type Person = {
  id: number;
  nama: string;
  email: string;
  role: "guru" | "siswa";
  kelas_id: number | null;
  nama_kelas?: string | null;
  foto_profil?: string | null;
  created_at?: string;
};
const blank = {
  nama: "",
  email: "",
  password: "",
  role: "siswa" as "guru" | "siswa",
  kelas_id: "",
  foto: null as File | null,
};
export default function UsersManager() {
  const [items, setItems] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  async function load() {
    setLoading(true);
    try {
      const r = await api<{ data: Person[] }>("/users");
      setItems(r.data || []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function openNew() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }
  function openEdit(u: Person) {
    setEditing(u.id);
    setForm({
      nama: u.nama,
      email: u.email,
      password: "",
      role: u.role,
      kelas_id: u.kelas_id ? String(u.kelas_id) : "",
      foto: null,
    });
    setModal(true);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("nama", form.nama);
      body.append("email", form.email);
      body.append("role", form.role);
      body.append("kelas_id", form.role === "siswa" ? form.kelas_id : "");
      if (form.password) body.append("password", form.password);
      if (form.foto) body.append("foto", form.foto);
      if (!editing && !form.password)
        throw new Error("Password wajib untuk akun baru.");
      await api(editing ? `/users/${editing}` : "/users", {
        method: editing ? "PATCH" : "POST",
        body,
      });
      setModal(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan pengguna");
    } finally {
      setBusy(false);
    }
  }
  async function remove(u: Person) {
    if (!confirm(`Hapus akun ${u.nama}?`)) return;
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus pengguna");
    }
  }
  const visible = items.filter((u) =>
    `${u.nama} ${u.email} ${u.role} ${u.nama_kelas || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>Data Pengguna</h2>
          <p className="muted" style={{ fontSize: 13 }}>
            Kelola akun guru dan siswa.
          </p>
        </div>
        <button className="btn" onClick={openNew}>
          <Plus size={16} />
          Tambah Pengguna
        </button>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="toolbar">
        <div style={{ position: "relative", maxWidth: 400, width: "100%" }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: 12, color: "#999" }}
          />
          <input
            className="search"
            style={{ paddingLeft: 38 }}
            placeholder="Cari nama, email, kelas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="badge">{visible.length} pengguna</span>
      </div>
      {loading ? (
        <div className="empty">Memuat pengguna...</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Kelas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 9 }}
                    >
                      <div className="avatar">
                        {u.foto_profil ? (
                          <img src={u.foto_profil} alt="" />
                        ) : (
                          u.nama.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <strong>{u.nama}</strong>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.role === "guru" ? "green" : "orange"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.nama_kelas || (u.kelas_id ? `ID ${u.kelas_id}` : "—")}
                  </td>
                  <td>
                    <div className="actions" style={{ marginTop: 0 }}>
                      <button
                        className="btn secondary"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil size={13} />
                        Ubah
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => void remove(u)}
                      >
                        <Trash2 size={13} />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="empty">Tidak ada pengguna ditemukan.</div>
          )}
        </div>
      )}
      {modal && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={submit}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>{editing ? "Ubah Pengguna" : "Tambah Pengguna"}</h2>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Nama</label>
                <input
                  required
                  minLength={3}
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as "guru" | "siswa",
                      kelas_id: e.target.value === "guru" ? "" : form.kelas_id,
                    })
                  }
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                </select>
              </div>
              {form.role === "siswa" && (
                <div className="field">
                  <label>ID Kelas (opsional)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.kelas_id}
                    onChange={(e) =>
                      setForm({ ...form, kelas_id: e.target.value })
                    }
                  />
                </div>
              )}
              <div className="field span2">
                <label>
                  {editing
                    ? "Password baru (kosongkan jika tidak diubah)"
                    : "Password (minimal 8 karakter)"}
                </label>
                <input
                  type="password"
                  minLength={editing ? 8 : 8}
                  required={!editing}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="field span2">
                <label>Foto profil (opsional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setForm({ ...form, foto: e.target.files?.[0] || null })
                  }
                />
              </div>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>
              Endpoint backend hanya mengizinkan admin mengelola akun
              guru/siswa. Untuk kelas gunakan ID kelas yang sudah ada di
              database.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => setModal(false)}
              >
                Batal
              </button>
              <button className="btn" disabled={busy}>
                {busy ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
