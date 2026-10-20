"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, BookOpen, ClipboardList } from "lucide-react";
import { api, getSavedUser, getToken, type Konten, type User } from "@/lib/api";
import { Portal, Welcome } from "@/components/Portal";
import Link from "next/link";
export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Konten[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (getSavedUser()?.role !== "admin") {
      router.replace("/");
      return;
    }
    Promise.all([
      api<{ data: User[] }>("/users"),
      api<{ data: Konten[] }>("/konten"),
    ])
      .then(([u, c]) => {
        setUsers(u.data || []);
        setItems(c.data || []);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Gagal memuat ringkasan"),
      );
  }, [router]);
  return (
    <Portal title="Dashboard Admin">
      <Welcome
        name={getSavedUser()?.nama || "Admin"}
        description="Kelola akun pengguna dan pantau konten pembelajaran di SIMS Sekolah."
      />
      <h2 className="section-title">Ringkasan</h2>
      <div className="stats">
        <Stat
          label="Total Pengguna"
          value={users.length}
          icon={<Users />}
          color="#e9efff"
          ink="#4f8cff"
        />
        <Stat
          label="Materi"
          value={items.filter((x) => x.jenis === "materi").length}
          icon={<BookOpen />}
          color="#e3f7f0"
          ink="#20b486"
        />
        <Stat
          label="Tugas"
          value={items.filter((x) => x.jenis === "tugas").length}
          icon={<ClipboardList />}
          color="#ffedf4"
          ink="#ec6b9a"
        />
      </div>
      {error && (
        <div className="alert" style={{ marginTop: 15 }}>
          {error}
        </div>
      )}
      <h2 className="section-title">Menu Admin</h2>
      <div className="menu-grid">
        <Menu
          href="/dashboard/admin/users"
          title="Data Pengguna"
          desc="Tambah, ubah, dan hapus akun guru serta siswa."
          icon={<Users />}
          color="#4f8cff"
        />
        <Menu
          href="/dashboard/admin/konten"
          title="Materi & Tugas"
          desc="Lihat semua materi dan tugas yang tersedia."
          icon={<BookOpen />}
          color="#20b486"
        />
        <Menu
          href="/profile"
          title="Profil Saya"
          desc="Lihat dan ubah nama serta foto profil."
          icon={<Users />}
          color="#ec6b9a"
        />
      </div>
    </Portal>
  );
}
function Stat({
  label,
  value,
  icon,
  color,
  ink,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  ink: string;
}) {
  return (
    <div className="stat">
      <div className="stat-icon" style={{ background: color, color: ink }}>
        {icon}
      </div>
      <label>{label}</label>
      <strong>{value}</strong>
    </div>
  );
}
function Menu({
  href,
  title,
  desc,
  icon,
  color,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link href={href} className="menu-card">
      <div className="menu-top">
        <div className="stat-icon" style={{ background: color + "1b", color }}>
          {icon}
        </div>
        <span className="muted">↗</span>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </Link>
  );
}
