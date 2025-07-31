import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const id = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");

    if (id) {
      // Fetch a single service by its unique ID
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ service: data }, { status: 200 });
    } else if (userId) {
      // Fetch all services associated with a given user ID
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", userId); // Assuming your column is named 'user_id'

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ services: data }, { status: 200 });
    } else {
      // Fallback: return all services
      const { data, error } = await supabase.from("services").select("*");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ services: data }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
