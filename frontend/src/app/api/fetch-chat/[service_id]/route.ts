import { fetchChatbyId } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { service_id: string } }
) {
  const { service_id } = params;

  if (!service_id || typeof service_id !== "string") {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  const data = await fetchChatbyId(service_id);

  if (!data) {
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
