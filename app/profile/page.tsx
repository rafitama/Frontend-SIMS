"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import { Portal } from "@/components/Portal";
import ProfileForm from "@/components/ProfileForm";
export default function ProfilePage() {
  const router = useRouter();
  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);
  return (
    <Portal title="Profil Saya">
      <ProfileForm />
    </Portal>
  );
}
