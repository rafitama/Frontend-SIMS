"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarClock,
  UserRound,
  LogOut,
  X,
  ShieldAlert,
} from "lucide-react";
import { clearSession, getSavedUser, type Role } from "@/lib/api";
import { useEffect, useState } from "react";

type Item = {
  label: string;
  href: string;
  icon: any;
};

const navByRole: Record<Role, Item[]> = {
  admin: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Data Pengguna",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Materi & Tugas",
      href: "/dashboard/admin/konten",
      icon: BookOpen,
    },
    {
      label: "Profil Saya",
      href: "/profile",
      icon: UserRound,
    },
  ],

  guru: [
    {
      label: "Dashboard",
      href: "/dashboard/guru",
      icon: LayoutDashboard,
    },
    {
      label: "Materi & Tugas",
      href: "/dashboard/guru/konten",
      icon: BookOpen,
    },
    {
      label: "Deadline Tugas",
      href: "/dashboard/guru/deadline",
      icon: CalendarClock,
    },
    {
      label: "Profil Saya",
      href: "/profile",
      icon: UserRound,
    },
  ],

  siswa: [
    {
      label: "Dashboard",
      href: "/dashboard/murid",
      icon: LayoutDashboard,
    },
    {
      label: "Materi & Tugas",
      href: "/dashboard/murid/konten",
      icon: BookOpen,
    },
    {
      label: "Deadline Tugas",
      href: "/dashboard/murid/deadline",
      icon: CalendarClock,
    },
    {
      label: "Profil Saya",
      href: "/profile",
      icon: UserRound,
    },
  ],
};

export function Portal({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<ReturnType<typeof getSavedUser>>(null);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    setUser(getSavedUser());
  }, []);

  useEffect(() => {
    if (!showLogout) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowLogout(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLogout]);

  const role: Role =
    user?.role ||
    (path.includes("/admin")
      ? "admin"
      : path.includes("/guru")
        ? "guru"
        : "siswa");

  const nav = navByRole[role];

  function logout() {
    clearSession();
    setShowLogout(false);
    router.replace("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brandmark">
            <GraduationCap size={24} />
          </span>
          <span>SIMS SEKOLAH</span>
        </Link>

        <div className="navlabel">MENU UTAMA</div>

        <nav className="nav">
          {nav.map((item) => {
            const Icon = item.icon;

            const active =
              path === item.href ||
              (item.href !== `/dashboard/${role}` &&
                path.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="logout"
          onClick={() => setShowLogout(true)}
        >
          <LogOut size={18} />
          Keluar
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>{title}</h1>

          <div className="userchip">
            <div>
              {user?.nama || "Pengguna"}
              <small>
                {role === "admin"
                  ? "Administrator"
                  : role === "guru"
                    ? "Guru"
                    : "Siswa"}
              </small>
            </div>

            <div className="avatar">
              {user?.foto_profil ? (
                <img src={user.foto_profil} alt="Foto profil" />
              ) : (
                <UserRound size={20} />
              )}
            </div>
          </div>
        </header>

        <div className="content">{children}</div>
      </main>

      {showLogout && (
        <div
          className="logout-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogout(false);
            }
          }}
        >
          <section
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
          >
            <button
              type="button"
              className="logout-close"
              onClick={() => setShowLogout(false)}
              aria-label="Tutup konfirmasi"
            >
              <X size={20} />
            </button>

            <div className="logout-icon">
              <ShieldAlert size={30} />
            </div>

            <h2 id="logout-title">Keluar dari akun?</h2>

            <p id="logout-description">
              Apakah kamu yakin ingin keluar dari akun SIMS Sekolah? Kamu harus
              masuk kembali untuk mengakses dashboard.
            </p>

            <div className="logout-actions">
              <button
                type="button"
                className="logout-cancel"
                onClick={() => setShowLogout(false)}
              >
                Batal
              </button>

              <button type="button" className="logout-confirm" onClick={logout}>
                <LogOut size={17} />
                Ya, Keluar
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .logout-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.38);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: overlayIn 0.2s ease;
        }

        .logout-modal {
          position: relative;
          width: 100%;
          max-width: 420px;
          box-sizing: border-box;
          padding: 34px 30px 28px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 25px 80px rgba(15, 23, 42, 0.22);
          text-align: center;
          animation: modalIn 0.25s ease;
        }

        .logout-close {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          padding: 0;
          border: none;
          border-radius: 10px;
          background: #f3f4f6;
          color: #64748b;
          cursor: pointer;
          transition: 0.2s;
        }

        .logout-close:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .logout-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          margin: 0 auto 20px;
          border-radius: 22px;
          background: #fff1f2;
          color: #ef4444;
        }

        .logout-modal h2 {
          margin: 0 0 12px;
          color: #1e293b;
          font-size: 23px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .logout-modal p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.8;
        }

        .logout-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }

        .logout-actions button {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 0 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.2s,
            transform 0.2s;
        }

        .logout-actions button:active {
          transform: scale(0.97);
        }

        .logout-cancel {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
        }

        .logout-cancel:hover {
          background: #f8fafc;
        }

        .logout-confirm {
          border: 1px solid #ef4444;
          background: #ef4444;
          color: #ffffff;
        }

        .logout-confirm:hover {
          border-color: #dc2626;
          background: #dc2626;
        }

        @keyframes overlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 480px) {
          .logout-modal {
            padding: 32px 20px 24px;
            border-radius: 20px;
          }

          .logout-modal h2 {
            font-size: 21px;
          }

          .logout-actions {
            gap: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logout-overlay,
          .logout-modal {
            animation: none;
          }

          .logout-actions button {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

export function Welcome({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <section className="welcome">
      <div>
        <h2>Halo, {name}!</h2>
        <p>{description}</p>
      </div>

      <GraduationCap className="welcome-icon" size={74} />
    </section>
  );
}
