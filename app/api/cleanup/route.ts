import { NextRequest, NextResponse } from "next/server";
import { cleanupSession } from "@/server/image-engine/imagekit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body?.sessionId as string | undefined;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Fire-and-forget cleanup (don't block the beacon response)
    cleanupSession(sessionId).catch((err) =>
      console.warn("[Cleanup] Session cleanup error:", err)
    );

    return NextResponse.json({ ok: true });
  } catch {
    // Always return 200 so browser beacon doesn't retry
    return NextResponse.json({ ok: true });
  }
}
