"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, saveSession, type User } from "@/lib/api";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      const result = await api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      saveSession(result.token, result.user);

      if (result.user.role === "admin") {
        router.replace("/dashboard/admin");
      } else if (result.user.role === "guru") {
        router.replace("/dashboard/guru");
      } else {
        router.replace("/dashboard/murid");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-side">
        <GraduationCap size={44} />
        <h1>Sistem Informasi Manajemen Sekolah</h1>
        <p>
          Kelola materi, tugas, dan aktivitas belajar melalui satu dashboard.
        </p>
      </section>

      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <h2>Selamat Datang</h2>
          <p>Masuk ke akun SIMS Sekolah kamu.</p>

          {error && <div className="alert">{error}</div>}

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
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Masukkan password"
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
            {busy ? "Memproses..." : "Masuk"}
          </button>

          <p style={{ marginTop: 20 }}>
            Belum punya akun siswa?{" "}
            <Link className="text-link" href="/register">
              Daftar
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
