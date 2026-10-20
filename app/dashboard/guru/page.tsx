"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FolderKanban,
  CalendarClock,
  UserRound,
} from "lucide-react";
import { api, getSavedUser, getToken, type Konten } from "@/lib/api";
import { Portal, Welcome } from "@/components/Portal";
export default function GuruDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Konten[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (getSavedUser()?.role !== "guru") {
      router.replace("/");
      return;
    }
    api<{ data: Konten[] }>("/konten")
      .then((r) => setItems(r.data || []))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Gagal memuat statistik"),
      );
  }, [router]);
  return (
    <Portal title="Dashboard Guru">
      <Welcome
        name={getSavedUser()?.nama || "Guru"}
        description="Buat dan kelola materi serta tugas untuk siswa kamu."
      />
      <h2 className="section-title">Ringkasan Konten</h2>
      <div className="stats">
        <Stat
          label="Total Konten"
          value={items.length}
          icon={<FolderKanban />}
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
      <h2 className="section-title">Menu Guru</h2>
      <div className="menu-grid">
        <Menu
          href="/dashboard/guru/konten"
          title="Materi & Tugas"
          desc="Tambah, ubah, dan hapus konten milik kamu."
          icon={<BookOpen />}
          color="#ffa640"
        />
        <Menu
          href="/dashboard/guru/deadline"
          title="Deadline Tugas"
          desc="Pantau tanggal tenggat tugas yang kamu buat."
          icon={<CalendarClock />}
          color="#20b486"
        />
        <Menu
          href="/dashboard/guru/kelas"
          title="Kelas yang Diajar"
          desc="Data daftar kelas belum tersedia pada API backend saat ini."
          icon={<FolderKanban />}
          color="#4f8cff"
        />
        <Menu
          href="/dashboard/guru/penilaian"
          title="Pengumpulan & Penilaian"
          desc="API pengumpulan dan penilaian belum tersedia pada backend."
          icon={<ClipboardList />}
          color="#8b6ce8"
        />
        <Menu
          href="/profile"
          title="Profil Saya"
          desc="Ubah nama dan foto profil akun guru."
          icon={<UserRound />}
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
