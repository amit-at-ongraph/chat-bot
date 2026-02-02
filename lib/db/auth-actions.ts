"use server";

import { supabase } from "@/lib/supabase";

export async function signUpAction(formData: {
  email: string;
  name: string;
  password: string;
  origin: string;
}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        },
        emailRedirectTo: `${formData.origin}/login`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: "An unexpected error occurred during sign up" };
  }
}
