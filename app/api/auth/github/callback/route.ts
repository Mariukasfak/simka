import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getGitHubAccessToken, getGitHubUser } from "@/lib/github";

// Nurodome Next.js, kad šis maršrutas turi būti dinaminis
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Saugiau gauti URL parametrus
    let code: string | null = null;
    try {
      const { searchParams } = new URL(request.url);
      code = searchParams.get("code");
    } catch (urlError) {
      console.error("Error parsing URL:", urlError);
      return NextResponse.json(
        { error: "Invalid request URL" },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Get GitHub access token
    const accessToken = await getGitHubAccessToken(code);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 400 },
      );
    }

    // Get GitHub user data
    const githubUser = await getGitHubUser(accessToken);

    // Store GitHub data in Supabase
    const supabase = createRouteHandlerClient({ cookies });

    const { data: user, error: userError } = await supabase
      .from("users")
      .update({
        github_id: githubUser.id.toString(),
        github_username: githubUser.login,
        github_access_token: accessToken,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();

    if (userError) {
      console.error("Error updating user:", userError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    // Naudojame tiesioginį peradresavimą be new URL objekto kūrimo
    const safeRedirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${safeRedirectUrl}/github/success`);
  } catch (error) {
    console.error("GitHub callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
