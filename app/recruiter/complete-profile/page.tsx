"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function RecruiterCompleteProfilePage() {
  const router = useRouter();
  
  // Step control
  const [step, setStep] = useState(1); // 1 = Biodata Recruiter, 2 = Biodata Perusahaan
  
  // Step 1: Recruiter Data
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState<boolean | "">("");
  const [dateofbirth, setDateofbirth] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState("");
  
  // Step 2: Company Data
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStep1Submit = async (e: React.FormEvent) => {
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
        gender: Boolean(gender),
        dateofbirth,
        address,
        position,
      });


      if (response.status === 200) {
        setSuccess("Biodata recruiter berhasil disimpan! Lanjut ke data perusahaan.");
        setTimeout(() => {
          setStep(2);
          setSuccess(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Error detail:", err);
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        console.error("Error response:", errorData);
        
        // Tampilkan error lebih detail
        let message = err.response?.data?.message || "Terjadi kesalahan saat menyimpan biodata";
        
        // Jika ada error field specific
        if (errorData?.error) {
          const errorFields = Object.entries(errorData.error)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join("; ");
          if (errorFields) {
            message += ` (${errorFields})`;
          }
        }
        
        setError(message);
      } else {
        setError("Terjadi kesalahan koneksi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axios.post("/api/companie", {
        name: companyName,
        industry: industry || null,
        employee_count: employeeCount ? parseInt(employeeCount) : null,
        location: location || null,
        description: description || null,
        website_url: websiteUrl || "",
      });

      if (response.status === 200) {
        setSuccess("Data perusahaan berhasil disimpan! Redirect ke dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data perusahaan";
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Lengkapi Profil Recruiter" : "Lengkapi Data Perusahaan"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Silakan lengkapi data diri Anda untuk mulai mengelola lowongan kerja"
              : "Silakan lengkapi data perusahaan yang Anda kelola"}
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex-1 h-2 rounded ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex-1 h-2 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>

        {/* Step 1: Biodata Recruiter */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
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
                {loading ? "Menyimpan..." : "Lanjut ke Data Perusahaan"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Step 2: Biodata Perusahaan */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit}>
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
                <Label htmlFor="companyName">Nama Perusahaan *</Label>
                <Input
                  id="companyName"
                  placeholder="Masukkan nama perusahaan"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industri</Label>
                  <Input
                    id="industry"
                    placeholder="Contoh: Technology, Finance"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Jumlah Karyawan</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    placeholder="Contoh: 50"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  placeholder="Contoh: Jakarta, Indonesia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://www.company.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Perusahaan</Label>
                <Textarea
                  id="description"
                  placeholder="Ceritakan tentang perusahaan Anda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-1/3"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan & Selesai"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
