import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token || token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await request.json();

  if (!commentId || typeof commentId !== "string") {
    return NextResponse.json({ error: "commentId required" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from("photo_comments")
    .update({ is_visible: false })
    .eq("id", commentId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to moderate comment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
