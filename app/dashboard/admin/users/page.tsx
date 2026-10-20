"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedUser, getToken } from "@/lib/api";
import { Portal } from "@/components/Portal";
import UsersManager from "@/components/UsersManager";
export default function AdminUsers() {
  const router = useRouter();
  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else if (getSavedUser()?.role !== "admin") router.replace("/");
  }, [router]);
  return (
    <Portal title="Data Pengguna">
      <UsersManager />
    </Portal>
  );
}
