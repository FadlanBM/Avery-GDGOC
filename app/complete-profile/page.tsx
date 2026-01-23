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

interface EducationLevel {
  id: string;
  name: string;
}

export default function CandidateCompleteProfilePage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState<boolean | "">("");
  const [dateofbirth, setDateofbirth] = useState("");
  const [lastEducation, setLastEducation] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingEducation, setFetchingEducation] = useState(true);

  useEffect(() => {
    const fetchEducationLevels = async () => {
      try {
        const response = await axios.get("/api/education");
        if (response.data.status) {
          setEducationLevels(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching education levels:", err);
        setError("Gagal memuat data tingkat pendidikan");
      } finally {
        setFetchingEducation(false);
      }
    };

    fetchEducationLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (gender === "") {
      setError("Silakan pilih jenis kelamin");
      return;
    }

    if (!lastEducation) {
      setError("Silakan pilih tingkat pendidikan terakhir");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "/api/auth-candidate/complete-profile",
        {
          fullname,
          gender: Boolean(gender),
          dateofbirth,
          last_education: lastEducation,
          address,
          phone,
        },
      );

      if (response.data.status) {
        setSuccess("Profil candidate berhasil dilengkapi!");
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
          <CardTitle>Lengkapi Profil Candidate</CardTitle>
          <CardDescription>
            Silakan lengkapi data diri Anda untuk mulai melamar pekerjaan
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
              <Label htmlFor="lastEducation">Pendidikan Terakhir</Label>
              <select
                id="lastEducation"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={lastEducation}
                onChange={(e) => setLastEducation(e.target.value)}
                required
                disabled={loading || fetchingEducation}
              >
                <option value="" disabled>
                  {fetchingEducation ? "Memuat data..." : "Pilih Pendidikan"}
                </option>
                {educationLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
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

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Profil Candidate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
