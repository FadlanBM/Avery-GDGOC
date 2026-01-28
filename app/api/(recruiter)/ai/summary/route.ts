import { createClient } from "@/lib/supabase/server";
import { validateUserRole } from "@/lib/validations/auth-check";
import { NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";
import { pathToFileURL } from "url";
import axios from "axios";

interface NamedItem {
  name: string;
}

interface JobDetail {
  id: string;
  title: string;
  description: string;
  min_experience_year: number;
  max_experience_year: number | null;
  education_level: NamedItem | NamedItem[] | null;
  employment_status: NamedItem | NamedItem[] | null;
  work_schedule: NamedItem | NamedItem[] | null;
  remote_status: NamedItem | NamedItem[] | null;
  companie: NamedItem | NamedItem[] | null;
}

function getName(item: NamedItem | NamedItem[] | null | undefined): string {
  if (!item) return "-";
  if (Array.isArray(item)) return item[0]?.name || "-";
  return item.name || "-";
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("job_application");
    const asset_id = searchParams.get("asset_id");
    const supabase = await createClient();

    // 1. Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: [authError?.message || "User not found"] },
        },
        { status: 401 },
      );
    }

    // 2. Role Check (Must be recruiter)
    const roleValidation = await validateUserRole(
      supabase,
      user.id,
      "recruiter",
    );
    if (!roleValidation.isValid) {
      return roleValidation.response;
    }

    // 3. Get Asset Info
    // We query the assets table to get the storage path
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("storage_path, mime_type, file_name")
      .eq("id", asset_id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json(
        {
          status: false,
          message: "File tidak ditemukan",
          error: { database: ["Asset not found"] },
        },
        { status: 404 },
      );
    }

    // 4. Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("assets")
      .download(asset.storage_path);

    if (downloadError || !fileData) {
      console.error("Storage download error:", downloadError);
      return NextResponse.json(
        {
          status: false,
          message: "Gagal mengunduh file",
          error: { storage: [downloadError?.message || "Download failed"] },
        },
        { status: 500 },
      );
    }
    const arrayBuffer = await fileData.arrayBuffer();
    const workerPath = path.resolve(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    let fullText = "";

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item: unknown): item is { str: string } =>
          Object.prototype.hasOwnProperty.call(item, "str"),
        )
        .map((item) => item.str)
        .join(" ");

      fullText += pageText + " ";
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: false,
          message: "API Key Gemini tidak ditemukan",
          error: { server: ["GEMINI_API_KEY missing"] },
        },
        { status: 500 },
      );
    }

    // 4. Get Job Application Detail with Relations
    const { data: application, error: fetchError } = await supabase
      .from("job_applications")
      .select(
        `
            id,
            candidate_job_match_id,
            status,
            applied_at,
            created_at,
            updated_at,
            job:job_id (
              id,
              title,
              description,
              status,
              min_experience_year,
              max_experience_year,
              no_experience_allowed,
              employment_status:employment_status_id(id, name),
              work_schedule:work_schedule_id(id, name),
              remote_status:remote_status_id(id, name),
              education_level:required_education_id(id, name),
              companie:company_id(id, name)
            ),
            job_application_status_log (
              id,
              message_status,
              changed_at,
              changed_by
            )
          `,
      )
      .eq("id", jobId)
      .single();

    console.log(application);

    if (fetchError || !application) {
      return NextResponse.json(
        {
          status: false,
          message: "Data lamaran tidak ditemukan",
          error: { database: [fetchError?.message || "Record not found"] },
        },
        { status: 404 },
      );
    }

    let prompt = "";

    if (jobId) {
      // Use Job Data from Application
      const jobRaw = application.job as unknown as JobDetail | JobDetail[];
      const job = Array.isArray(jobRaw) ? jobRaw[0] : jobRaw;

      if (!job) {
        return NextResponse.json(
          {
            status: false,
            message: "Data pekerjaan tidak ditemukan dalam lamaran",
            error: { database: ["Job not found in application"] },
          },
          { status: 404 },
        );
      }

      // Fetch Candidate CV Data to get user_id and candidate_cv_id
      const { data: cv, error: cvError } = await supabase
        .from("candidate_cv")
        .select("id, user_id")
        .eq("asset_id", asset_id)
        .single();

      if (cvError || !cv) {
        // If direct link not found, maybe just proceed with asset_id (but we can't return user_id/candidate_cv)
        // For now, let's assume we need this link.
        console.warn("Candidate CV link not found for asset:", asset_id);
      }

      prompt = `
        Analisis kecocokan antara Kandidat (berdasarkan teks CV) dan Pekerjaan berikut.
        
        DATA PEKERJAAN:
        Judul: ${job.title}
        Deskripsi: ${job.description}
        Min Pengalaman: ${job.min_experience_year} tahun
        Maks Pengalaman: ${job.max_experience_year || "Tidak dibatasi"} tahun
        Pendidikan: ${getName(job.education_level)}
        Tipe: ${getName(job.employment_status)}
        Jadwal: ${getName(job.work_schedule)}
        Lokasi/Remote: ${getName(job.remote_status)}
        Perusahaan: ${getName(job.companie)}
        
        DATA KANDIDAT (CV):
        ${fullText}
        
        INSTRUKSI:
        Berikan output HANYA dalam format JSON (tanpa markdown formatting seperti \`\`\`json).
        JSON harus memiliki struktur berikut agar sesuai dengan tabel database:
        {
          "overall_match_score": (number 0-100),
          "skill_match": (number 0-100),
          "experience_score": (number 0-100),
          "explanation_text": (string ringkasan analisis),
          "explanation_json": {
            "pros": ["string"],
            "cons": ["string"],
            "missing_skills": ["string"],
            "matched_skills": ["string"]
          }
        }
      `;
    } else {
      // Default Summary Prompt
      prompt = `
        Buatkan ringkasan profesional yang komprehensif dari CV berikut dalam bahasa Indonesia. 
        Format output dalam Markdown.
        
        Struktur yang diinginkan:
        1. **Profil Singkat**: Ringkasan 2-3 kalimat tentang kandidat.
        2. **Keahlian Utama**: Daftar bullet points skill teknis dan soft skills.
        3. **Pengalaman Relevan**: Ringkasan pengalaman kerja yang paling menonjol.
        4. **Pendidikan**: Pendidikan terakhir.
        
        Isi CV:
        ${fullText}
      `;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const aiResponse = await axios.post(
      geminiUrl,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    const aiText =
      aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gagal menghasilkan output.";

    // Try to parse JSON
    let matchData;
    try {
      const cleanedJson = aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      matchData = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      matchData = { error: "Failed to parse AI response", raw: aiText };
    }

    const matchResult = {
      model_name: "gemini-3-flash-preview",
      overall_match_score: matchData.overall_match_score || 0,
      skill_match: matchData.skill_match || 0,
      experience_score: matchData.experience_score || 0,
      explanation_json: matchData.explanation_json || {},
      explanation_text: matchData.explanation_text || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let candidateJobMatchId: string | null = null;
    if (application.candidate_job_match_id) {
      candidateJobMatchId = application.candidate_job_match_id;
      const updateData = {
        model_name: matchResult.model_name,
        overall_match_score: matchResult.overall_match_score,
        skill_match: matchResult.skill_match,
        experience_score: matchResult.experience_score,
        explanation_json: matchResult.explanation_json,
        explanation_text: matchResult.explanation_text,
        updated_at: new Date().toISOString(),
      };
      const { error: updateMatchError } = await supabase
        .from("candidate_job_match")
        .update(updateData)
        .eq("id", candidateJobMatchId);
      if (updateMatchError) {
        console.error("Update candidate_job_match error:", updateMatchError);
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("candidate_job_match")
        .insert(matchResult)
        .select("id")
        .single();
      if (insertError) {
        console.error("Insert match error:", insertError);
      } else {
        candidateJobMatchId = inserted?.id || null;
        const { error: updateError } = await supabase
          .from("job_applications")
          .update({ candidate_job_match_id: candidateJobMatchId })
          .eq("id", jobId);
        if (updateError) {
          console.error("Update job application error:", updateError);
        }
      }
    }

    return NextResponse.json({
      status: true,
      message: "Analisis kecocokan berhasil dibuat",
      data: {
        ...matchResult,
        id: candidateJobMatchId,
        candidate_job_match_id: candidateJobMatchId,
      },
    });
  } catch (error) {
    console.error("Get CV file error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        status: false,
        message: "Terjadi kesalahan internal server",
        error: { server: [errorMessage] },
      },
      { status: 500 },
    );
  }
}
