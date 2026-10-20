"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedUser, getToken } from "@/lib/api";
import { Portal } from "@/components/Portal";
import { School } from "lucide-react";
export default function KelasGuru() {
  const router = useRouter();
  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else if (getSavedUser()?.role !== "guru") router.replace("/");
  }, [router]);
  return (
    <Portal title="Kelas yang Diajar">
      <div className="panel empty">
        <School size={42} style={{ marginBottom: 12, color: "#6c63ff" }} />
        <h2 style={{ color: "#292943" }}>Data kelas belum tersedia</h2>
        <p>
          Backend saat ini belum menyediakan endpoint daftar kelas atau daftar
          kelas yang diajar guru. Halaman ini tidak mengambil data palsu.
        </p>
        <p>
          Konten tetap dapat ditautkan ke kelas menggunakan{" "}
          <code>kelas_id</code> yang sudah ada di database.
        </p>
      </div>
    </Portal>
  );
}
