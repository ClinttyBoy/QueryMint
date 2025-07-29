import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      // Fetch a single project by id
      const { data, error } = await supabase
        .from("services") // replace with your actual table name
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ service: data }, { status: 200 });
    } else {
      const { data, error } = await supabase
        .from("services") // replace with your actual table name
        .select("*");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ services: data }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
