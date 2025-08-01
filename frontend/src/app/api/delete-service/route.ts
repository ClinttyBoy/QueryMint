// app/api/delete-service/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/utils";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    console.log(id);

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required for deletion." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error deleting service:", error);
      return NextResponse.json(
        { error: "Failed to delete service." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data, message: "Service deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
