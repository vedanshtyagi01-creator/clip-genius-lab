import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // For now, just create/update a free subscription record
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!existingSubscriber) {
      await supabaseClient.from("subscribers").insert({
        user_id: user.id,
        email: user.email,
        subscribed: false,
        subscription_tier: "Free",
        clips_used_this_month: 0,
        updated_at: new Date().toISOString(),
      });
      
      logStep("Created free subscription record");
    }

    return new Response(JSON.stringify({
      subscribed: existingSubscriber?.subscribed || false,
      subscription_tier: existingSubscriber?.subscription_tier || "Free",
      clips_used: existingSubscriber?.clips_used_this_month || 0,
      clips_limit: existingSubscriber?.subscribed ? "unlimited" : 2
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});