"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Briefcase, TrendingUp, Users } from "lucide-react";

export function OnboardingEmptyState() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-4">
              <div className="p-4 rounded-full bg-blue-100">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <div className="p-4 rounded-full bg-purple-100">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="p-4 rounded-full bg-green-100">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Belum Ada Data Analytics</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Mulai perjalanan rekrutmen Anda dengan membuat lowongan pekerjaan pertama. 
                Setelah kandidat melamar, analytics akan otomatis tersedia di sini.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => router.push("/job-openings/create")}
              >
                Buat Lowongan Pertama
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/job-openings")}
              >
                Lihat Lowongan
              </Button>
            </div>

            <div className="pt-8 border-t mt-8">
              <h3 className="font-semibold mb-4">Yang Akan Anda Dapatkan:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="space-y-2">
                  <div className="font-medium text-sm">Hiring Funnel</div>
                  <p className="text-xs text-muted-foreground">
                    Lacak progress kandidat dari aplikasi hingga hired
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-sm">Top Jobs</div>
                  <p className="text-xs text-muted-foreground">
                    Lihat lowongan dengan performa terbaik
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-sm">Trend Analysis</div>
                  <p className="text-xs text-muted-foreground">
                    Analisa pola aplikasi dan konversi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
