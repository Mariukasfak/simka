import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Please use /api/submit-design instead.",
    },
    { status: 410 },
  );
}
