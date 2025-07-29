import { pinataClient } from "@/lib/pinata";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const projectId = data.get("service_id") as string | null;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "Missing file or service_id" },
        { status: 400 }
      );
    }

    const { cid } = await pinataClient.upload.public.file(file).keyvalues({
      projectId,
    });
    const url = await pinataClient.gateways.public.convert(cid);
    return NextResponse.json(url, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
