import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin using their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Ikke autentisert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a client with the caller's JWT to check admin status
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: isAdmin, error: adminErr } = await callerClient.rpc("is_admin");
    if (adminErr || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Kun administratorer kan bruke denne funksjonen" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action } = body;

    if (action === "invite") {
      const { email, name } = body;
      if (!email) {
        return new Response(
          JSON.stringify({ error: "E-post er påkrevd" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if auth user already exists
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u: any) => u.email === email
      );

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "En bruker med denne e-postadressen finnes allerede", userId: existingUser.id }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user with auto-confirm (no email verification needed)
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name: name || email.split("@")[0] },
      });

      if (createErr) {
        return new Response(
          JSON.stringify({ error: createErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, userId: newUser.user?.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "generate-invite-link") {
      const { email } = body;
      if (!email) {
        return new Response(
          JSON.stringify({ error: "E-post er påkrevd" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: "invite",
        email,
      });

      if (linkErr) {
        return new Response(
          JSON.stringify({ error: linkErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, link: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reset-password") {
      const { email } = body;
      if (!email) {
        return new Response(
          JSON.stringify({ error: "E-post er påkrevd" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find user by email then generate password reset
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const user = existingUsers?.users?.find((u: any) => u.email === email);
      if (!user) {
        return new Response(
          JSON.stringify({ error: "Bruker ikke funnet" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error: resetErr } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email,
      });

      if (resetErr) {
        return new Response(
          JSON.stringify({ error: resetErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, link: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ukjent handling: " + action }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Intern feil" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
