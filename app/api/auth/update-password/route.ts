import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { code, accessToken, refreshToken, password } = await req.json();

    if ((!code && !accessToken) || !password) {
      return NextResponse.json(
        { error: "Code (or access token) and password are required" },
        { status: 400 }
      );
    }

    if (code) {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        code
      );

      if (exchangeError) {
        return NextResponse.json({ error: exchangeError.message }, { status: 400 });
      }

      if (!data.user) {
        return NextResponse.json(
          { error: "No user found from the provided code." },
          { status: 400 }
        );
      }
    } else if (accessToken) {
      // If we have an access token, we try to set the session.
      // Ideally we also want the refresh_token, but setSession might work with just access_token for a short while.
      // However, if we don't have refresh_token, we can only do things valid for the access_token's lifespan.
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "", // Some versions of supabase-js might require this field
      });

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 400 });
      }
      
      if (!data.user) {
         // Fallback verification if setSession didn't return user but didn't error?
         // Usually it returns user.
         const { data: userData, error: userError } = await supabase.auth.getUser();
         if (userError || !userData.user) {
             return NextResponse.json({ error: "Invalid access token." }, { status: 401 });
         }
      }
    }

    // Now update the user's password
    // Since we have an active session on this client instance
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
