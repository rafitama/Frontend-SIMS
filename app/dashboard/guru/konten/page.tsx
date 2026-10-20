"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedUser, getToken } from "@/lib/api";
import { Portal } from "@/components/Portal";
import ContentManager from "@/components/ContentManager";
export default function GuruKonten() {
  const router = useRouter();
  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else if (getSavedUser()?.role !== "guru") router.replace("/");
  }, [router]);
  return (
    <Portal title="Materi & Tugas">
      <ContentManager role="guru" />
    </Portal>
  );
}
