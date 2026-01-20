"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function RecruiterCompleteProfilePage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [companieId, setCompanieId] = useState("");
  const [gender, setGender] = useState<boolean | "">("");
  const [dateofbirth, setDateofbirth] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (gender === "") {
      setError("Silakan pilih jenis kelamin");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth-recruiter/hrd-employee", {
        fullname,
        companie_id: companieId,
        gender: Boolean(gender),
        dateofbirth,
        address,
        position,
      });

      if (response.status === 200) {
        setSuccess("Profil berhasil dilengkapi!");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan profil";
        setError(message);
      } else {
        setError("Terjadi kesalahan koneksi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Lengkapi Profil Recruiter</CardTitle>
          <CardDescription>
            Silakan lengkapi data diri Anda untuk mulai mengelola lowongan kerja
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullname">Nama Lengkap</Label>
              <Input
                id="fullname"
                placeholder="Masukkan nama lengkap"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companieId">ID Perusahaan (UUID)</Label>
              <Input
                id="companieId"
                placeholder="Masukkan UUID Perusahaan"
                value={companieId}
                onChange={(e) => setCompanieId(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={gender === "" ? "" : gender ? "true" : "false"}
                  onChange={(e) => setGender(e.target.value === "true")}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>
                    Pilih Gender
                  </option>
                  <option value="true">Laki-laki</option>
                  <option value="false">Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateofbirth">Tanggal Lahir</Label>
                <Input
                  id="dateofbirth"
                  type="date"
                  value={dateofbirth}
                  onChange={(e) => setDateofbirth(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Jabatan</Label>
              <Input
                id="position"
                placeholder="Contoh: HR Manager / Tech Recruiter"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                placeholder="Masukkan alamat lengkap"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Profil Recruiter"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
