import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Mock candidates data
const mockCandidates = [
  {
    id: "1",
    name: "Sarah Jenkin",
    email: "sarah.jenkin@email.com",
    applied_role: "Senior React Developer",
    experience: "6 years",
    ai_match: 94,
    status: "Interview",
    applied_date: "2026-01-08",
  },
  {
    id: "2",
    name: "Marcus Chen",
    email: "marcus.chen@email.com",
    applied_role: "Senior React Developer",
    experience: "8 years",
    ai_match: 91,
    status: "Screening",
    applied_date: "2026-01-07",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily@email.com",
    applied_role: "Product Manager",
    experience: "5 years",
    ai_match: 88,
    status: "New",
    applied_date: "2026-01-10",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "jwilson@email.com",
    applied_role: "Senior React Developer",
    experience: "4 years",
    ai_match: 76,
    status: "Rejected",
    applied_date: "2026-01-05",
  },
  {
    id: "5",
    name: "Alisha Patel",
    email: "alisha.patel@email.com",
    applied_role: "UX Designer",
    experience: "7 years",
    ai_match: 92,
    status: "Interview",
    applied_date: "2026-01-09",
  },
  {
    id: "6",
    name: "David Kim",
    email: "d.kim@email.com",
    applied_role: "Backend Engineer",
    experience: "5 years",
    ai_match: 85,
    status: "Screening",
    applied_date: "2026-01-06",
  },
  {
    id: "7",
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    applied_role: "Frontend Developer",
    experience: "3 years",
    ai_match: 82,
    status: "New",
    applied_date: "2026-01-04",
  },
  {
    id: "8",
    name: "Michael Chang",
    email: "m.chang@email.com",
    applied_role: "DevOps Engineer",
    experience: "6 years",
    ai_match: 89,
    status: "Interview",
    applied_date: "2026-01-03",
  },
  {
    id: "9",
    name: "Rachel Green",
    email: "rachel.g@email.com",
    applied_role: "Product Designer",
    experience: "4 years",
    ai_match: 87,
    status: "Screening",
    applied_date: "2026-01-02",
  },
  {
    id: "10",
    name: "John Smith",
    email: "john.smith@email.com",
    applied_role: "Full Stack Developer",
    experience: "7 years",
    ai_match: 90,
    status: "Interview",
    applied_date: "2026-01-01",
  },
  {
    id: "11",
    name: "Amanda Lee",
    email: "amanda.lee@email.com",
    applied_role: "QA Engineer",
    experience: "5 years",
    ai_match: 78,
    status: "New",
    applied_date: "2025-12-30",
  },
  {
    id: "12",
    name: "Robert Brown",
    email: "r.brown@email.com",
    applied_role: "Data Analyst",
    experience: "4 years",
    ai_match: 84,
    status: "Screening",
    applied_date: "2025-12-29",
  },
];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          status: false,
          message: "Unauthorized: Silakan login terlebih dahulu",
          error: { auth: ["Session not found"] },
        },
        { status: 401 }
      );
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");

    // Sort by applied_date DESC (newest first)
    const sortedCandidates = [...mockCandidates].sort((a, b) => 
      new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime()
    );

    // Calculate pagination
    const totalCandidates = sortedCandidates.length;
    const totalPages = Math.ceil(totalCandidates / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex);

    return NextResponse.json({
      status: true,
      message: "Candidates retrieved successfully",
      data: paginatedCandidates,
      pagination: {
        currentPage: page,
        totalPages,
        totalCandidates,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching candidates:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch candidates",
        error: { server: [errorMessage] },
      },
      { status: 500 }
    );
  }
}
