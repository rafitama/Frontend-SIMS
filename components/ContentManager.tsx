"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, type Konten, type Role } from "@/lib/api";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarClock,
  BookOpen,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";

type Props = {
  role: Role;
  mode?: "all" | "deadline";
};

const blank = {
  judul: "",
  deskripsi: "",
  jenis: "materi" as "materi" | "tugas",
  kelas_id: "",
  deadline: "",
  gambar: null as File | null,
};

export default function ContentManager({
  role,
  mode = "all",
}: Props) {
  const [items, setItems] = useState<Konten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const [deleteItem, setDeleteItem] = useState<Konten | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = role === "guru";

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await api<{ data: Konten[] }>("/konten");
      setItems(res.data || []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal memuat konten",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!modal && !deleteItem) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy && !deleting) {
        setModal(false);
        setDeleteItem(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal, deleteItem, busy, deleting]);

  const visible = useMemo(
    () =>
      items.filter((item) => {
        const matches =
          `${item.judul} ${item.deskripsi} ${item.nama_kelas || ""} ${item.nama_guru || ""}`
            .toLowerCase()
            .includes(query.toLowerCase());

        return matches && (mode !== "deadline" || item.jenis === "tugas");
      }),
    [items, query, mode],
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...blank });
    setModal(true);
  }

  function openEdit(item: Konten) {
    setEditing(item.id);
    setForm({
      judul: item.judul,
      deskripsi: item.deskripsi,
      jenis: item.jenis,
      kelas_id: String(item.kelas_id),
      deadline: item.deadline
        ? item.deadline.replace(" ", "T").slice(0, 16)
        : "",
      gambar: null,
    });
    setModal(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const body = new FormData();
      body.append("judul", form.judul);
      body.append("deskripsi", form.deskripsi);
      body.append("jenis", form.jenis);
      body.append("kelas_id", form.kelas_id);

      if (form.jenis === "tugas") {
        body.append("deadline", form.deadline.slice(0, 10));
      }
      
      if (form.gambar) {
        body.append("gambar", form.gambar);
      }

      const path = editing ? `/konten/${editing}` : "/konten";

      await api(path, {
        method: editing ? "PATCH" : "POST",
        body,
      });

      setModal(false);
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal menyimpan konten",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleteItem) return;

    setDeleting(true);
    setError("");

    try {
      await api(`/konten/${deleteItem.id}`, {
        method: "DELETE",
      });

      setItems((current) =>
        current.filter((item) => item.id !== deleteItem.id),
      );

      setDeleteItem(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal menghapus konten",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2>
            {mode === "deadline" ? "Deadline Tugas" : "Materi & Tugas"}
          </h2>
          <p className="muted" style={{ fontSize: 13 }}>
            Kelola materi dan tugas dari API SIMS.
          </p>
        </div>

        {canEdit && mode === "all" && (
          <button className="btn" onClick={openCreate}>
            <Plus size={16} />
            Tambah Konten
          </button>
        )}
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="toolbar">
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              color: "#999",
            }}
          />
          <input
            className="search"
            style={{ paddingLeft: 38 }}
            placeholder="Cari judul, deskripsi, kelas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <span className="badge">{visible.length} konten</span>
      </div>

      {loading ? (
        <div className="empty">Memuat konten...</div>
      ) : visible.length === 0 ? (
        <div className="panel empty">
          Belum ada data untuk ditampilkan.
        </div>
      ) : (
        <div className="content-grid">
          {visible.map((item) => (
            <article className="content-card" key={item.id}>
              {item.gambar && (
                <img src={item.gambar} alt={item.judul} />
              )}

              <div className="content-body">
                <div className="content-meta">
                  <span
                    className={`badge ${
                      item.jenis === "materi" ? "green" : "orange"
                    }`}
                  >
                    {item.jenis === "materi" ? "Materi" : "Tugas"}
                  </span>

                  <span>
                    {item.nama_kelas || `Kelas ID ${item.kelas_id}`}
                  </span>
                </div>

                <h3>{item.judul}</h3>
                <p>{item.deskripsi}</p>

                <div className="content-meta">
                  {item.nama_guru && (
                    <span>Guru: {item.nama_guru}</span>
                  )}

                  {item.deadline && (
                    <span>
                      <CalendarClock
                        size={13}
                        style={{ verticalAlign: "middle" }}
                      />{" "}
                      Deadline:{" "}
                      {new Date(
                        item.deadline.replace(" ", "T"),
                      ).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>

                {canEdit && (
                  <div className="actions">
                    <button
                      className="btn secondary"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={14} />
                      Ubah
                    </button>

                    <button
                      className="btn danger"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Popup tambah dan edit */}
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) {
              setModal(false);
            }
          }}
        >
          <form className="modal" onSubmit={submit}>
            <div className="modal-heading">
              <h2>{editing ? "Ubah Konten" : "Tambah Konten"}</h2>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setModal(false)}
                disabled={busy}
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            <div className="form-grid">
              <div className="field span2">
                <label>Judul</label>
                <input
                  required
                  minLength={3}
                  value={form.judul}
                  onChange={(e) =>
                    setForm({ ...form, judul: e.target.value })
                  }
                />
              </div>

              <div className="field span2">
                <label>Deskripsi</label>
                <textarea
                  required
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Jenis</label>
                <select
                  value={form.jenis}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      jenis: e.target.value as "materi" | "tugas",
                      deadline:
                        e.target.value === "materi"
                          ? ""
                          : form.deadline,
                    })
                  }
                >
                  <option value="materi">Materi</option>
                  <option value="tugas">Tugas</option>
                </select>
              </div>

              <div className="field">
                <label>ID Kelas</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.kelas_id}
                  onChange={(e) =>
                    setForm({ ...form, kelas_id: e.target.value })
                  }
                  placeholder="Masukkan ID kelas"
                />
              </div>

              {form.jenis === "tugas" && (
                <div className="field span2">
                  <label>Deadline</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="field span2">
                <label>Gambar (opsional, JPG/PNG/WEBP maksimal 5 MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gambar: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
            </div>

            <div className="muted" style={{ fontSize: 12 }}>
              Gunakan ID kelas numerik yang tersedia di database.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => setModal(false)}
                disabled={busy}
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

      {/* Popup konfirmasi hapus tepat di tengah layar */}
      {deleteItem && (
        <div
          className="delete-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setDeleteItem(null);
            }
          }}
        >
          <section
            className="delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
          >
            <button
              type="button"
              className="delete-close"
              onClick={() => setDeleteItem(null)}
              disabled={deleting}
              aria-label="Tutup konfirmasi"
            >
              <X size={19} />
            </button>

            <div className="delete-icon">
              <ShieldAlert size={30} />
            </div>

            <h2 id="delete-title">Hapus konten?</h2>

            <p id="delete-description">
              Kamu yakin ingin menghapus{" "}
              <strong>{deleteItem.judul}</strong>? Konten yang sudah
              dihapus tidak bisa ditampilkan kembali dari halaman ini.
            </p>

            <div className="delete-item-info">
              {deleteItem.jenis === "materi" ? (
                <BookOpen size={18} />
              ) : (
                <ClipboardList size={18} />
              )}

              <div>
                <strong>{deleteItem.judul}</strong>
                <span>
                  {deleteItem.jenis === "materi" ? "Materi" : "Tugas"}
                </span>
              </div>
            </div>

            <div className="delete-actions">
              <button
                type="button"
                className="delete-cancel"
                onClick={() => setDeleteItem(null)}
                disabled={deleting}
              >
                Batal
              </button>

              <button
                type="button"
                className="delete-confirm"
                onClick={() => void remove()}
                disabled={deleting}
              >
                <Trash2 size={16} />
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .modal-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .modal-heading h2 {
          margin: 0 0 18px;
        }

        .delete-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          background: rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: overlay-in 0.2s ease;
        }

        .delete-modal {
          position: relative;
          width: 100%;
          max-width: 430px;
          margin: auto;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 25px 80px rgba(15, 23, 42, 0.24);
          text-align: center;
          animation: modal-in 0.22s ease;
        }

        .delete-close {
          position: absolute;
          top: 14px;
          right: 14px;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 0;
          border-radius: 10px;
          background: #f3f4f6;
          color: #64748b;
          cursor: pointer;
        }

        .delete-close:hover {
          background: #e5e7eb;
        }

        .delete-icon {
          display: grid;
          place-items: center;
          width: 68px;
          height: 68px;
          margin: 0 auto 20px;
          border-radius: 22px;
          background: #fff0f1;
          color: #e53945;
        }

        .delete-modal h2 {
          margin: 0 0 12px;
          color: #1e293b;
          font-size: 23px;
          font-weight: 800;
        }

        .delete-modal > p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .delete-modal > p strong {
          color: #334155;
        }

        .delete-item-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
          padding: 13px;
          border: 1px solid #e8eaf2;
          border-radius: 14px;
          background: #f8f9fc;
          color: #6c63ff;
          text-align: left;
        }

        .delete-item-info div {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .delete-item-info strong {
          color: #292943;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .delete-item-info span {
          color: #858597;
          font-size: 11px;
          text-transform: capitalize;
        }

        .delete-actions {
          display: flex;
          gap: 12px;
          margin-top: 26px;
        }

        .delete-actions button {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .delete-cancel {
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
        }

        .delete-cancel:hover {
          background: #f8fafc;
        }

        .delete-confirm {
          border: 1px solid #e53945;
          background: #e53945;
          color: #fff;
        }

        .delete-confirm:hover:not(:disabled) {
          border-color: #c92532;
          background: #c92532;
          box-shadow: 0 5px 15px rgba(229, 57, 69, 0.2);
        }

        .delete-actions button:disabled,
        .delete-close:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        @keyframes overlay-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modal-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 480px) {
          .delete-modal {
            padding: 30px 20px 22px;
            border-radius: 20px;
          }

          .delete-modal h2 {
            font-size: 21px;
          }

          .delete-actions {
            gap: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .delete-overlay,
          .delete-modal {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
