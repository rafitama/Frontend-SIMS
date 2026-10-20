"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSavedUser, getToken } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getSavedUser();
    if (user?.role === "admin") {
      router.replace("/dashboard/admin");
    } else if (user?.role === "guru") {
      router.replace("/dashboard/guru");
    } else {
      router.replace("/dashboard/murid");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center font-sans text-gray-600">
      Memuat SIMS Sekolah...
    </div>
  );
}
