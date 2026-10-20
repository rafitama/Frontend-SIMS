"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedUser, getToken } from "@/lib/api";
import { Portal } from "@/components/Portal";
import ContentManager from "@/components/ContentManager";
export default function AdminKonten() {
  const router = useRouter();
  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else if (getSavedUser()?.role !== "admin") router.replace("/");
  }, [router]);
  return (
    <Portal title="Materi & Tugas">
      <div className="alert">
        Mode admin hanya melihat konten. Backend membatasi pembuatan,
        pengubahan, dan penghapusan konten untuk guru pemilik.
      </div>
      <ContentManager role="admin" />
    </Portal>
  );
}
