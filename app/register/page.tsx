"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [kelas, setKelas] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const result = await api<{ message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nama: nama.trim(),
          email: email.trim(),
          kelas: kelas.trim().toUpperCase(),
          password,
        }),
      });

      setSuccess(result.message || "Registrasi berhasil.");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-side">
        <GraduationCap size={44} />
        <h1>Mulai belajar bersama SIMS</h1>
        <p>Buat akun siswa untuk melihat materi dan tugas sesuai kelas kamu.</p>
      </section>

      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <h2>Daftar Akun</h2>
          <p>Lengkapi data untuk membuat akun siswa.</p>

          {error && <div className="alert">{error}</div>}

          {success && <div className="alert success">{success}</div>}

          <div className="field">
            <label htmlFor="nama">Nama Lengkap</label>
            <input
              id="nama"
              type="text"
              required
              minLength={3}
              autoComplete="name"
              placeholder="Masukkan nama lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="kelas">Kelas</label>
            <input
              id="kelas"
              type="text"
              required
              maxLength={50}
              placeholder="Contoh: X RPL 1"
              autoCapitalize="characters"
              style={{ textTransform: "uppercase" }}
              value={kelas}
              onChange={(e) => setKelas(e.target.value.toUpperCase())}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Mendaftar..." : "Daftar"}
          </button>

          <p style={{ marginTop: 20 }}>
            Sudah punya akun?{" "}
            <Link className="text-link" href="/login">
              Masuk
            </Link>
          </p>
        </form>
      </section>

      <style jsx>{`
        .password-wrapper {
          position: relative;
          width: 100%;
        }

        .password-wrapper input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding-right: 48px;
        }

        .password-wrapper .password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 5px;
          background: transparent;
          color: #777;
          box-shadow: none;
          cursor: pointer;
        }

        .password-wrapper .password-toggle:hover {
          background: #f0efff;
          color: #6c63ff;
        }

        .password-wrapper .password-toggle:focus-visible {
          outline: 2px solid #6c63ff;
        }
      `}</style>
    </main>
  );
}
