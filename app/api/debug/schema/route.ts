import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Query to get column information from the job table
    const { data, error } = await supabase.from("job").select("*").limit(1);

    if (error) {
      console.error("Error querying job table:", error);
      return NextResponse.json(
        {
          status: false,
          message: "Failed to query job table",
          error: error.message,
        },
        { status: 400 },
      );
    }

    // Get column names from the first row
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

    // Also try to query information_schema if available
    const { data: schemaData, error: schemaError } = await supabase
      .rpc("exec_sql", {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'job'
          ORDER BY ordinal_position;
        `,
      })
      .match(() => ({ data: null, error: null }));

    return NextResponse.json({
      status: true,
      message: "Job table schema",
      columns: columns,
      sample_data: data?.[0] || null,
      schema_info: schemaData || "Schema query not available",
    });
  } catch (err) {
    console.error("Schema check error:", err);
    return NextResponse.json(
      {
        status: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
