export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Role = "admin" | "guru" | "siswa";
export type User = {
  id: number;
  nama: string;
  email: string;
  role: Role;
  kelas_id: number | null;
  nama_kelas?: string | null;
  foto_profil?: string | null;
  created_at?: string;
};
export type Konten = {
  id: number;
  judul: string;
  deskripsi: string;
  jenis: "materi" | "tugas";
  gambar: string | null;
  deadline: string | null;
  guru_id: number;
  kelas_id: number;
  created_at: string;
  nama_kelas?: string;
  nama_guru?: string;
};

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("sims_token") || "";
}
export function saveSession(token: string, user?: User) {
  localStorage.setItem("sims_token", token);
  if (user) localStorage.setItem("sims_user", JSON.stringify(user));
}
export function getSavedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem("sims_user");
    return value ? JSON.parse(value) as User : null;
  } catch {
    return null;
  }
}
export function clearSession() {
  localStorage.removeItem("sims_token");
  localStorage.removeItem("sims_user");
}
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearSession();
    }
    throw new Error(result.message || `Permintaan gagal (${response.status})`);
  }
  return result as T;
}
export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}
