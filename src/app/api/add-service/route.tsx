import { NextRequest, NextResponse } from "next/server";
import { insertUser, supabase } from "@/lib/utils";
import { Service } from "@/types/Service";

export async function POST(req: NextRequest) {
  try {
    const res: Service = await req.json();
    // console.log(res);
    if (!res.user_id || !res.data_url) {
      return NextResponse.json(
        { error: "Email or Data file is missing!" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("services")
      .insert([res])
      .select();

    console.log(data);
    if (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json(
        { error: "Error fetching user" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
