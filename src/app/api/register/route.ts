import { NextResponse } from "next/server";

/** Placeholder route so the file is a valid module. Wire up credential signup here when needed. */
export async function POST() {
  return NextResponse.json(
    { error: "Registration endpoint is not configured." },
    { status: 501 },
  );
}
