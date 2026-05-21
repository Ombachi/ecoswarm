import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const callerId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { action, target_user_id, role } = body ?? {};

    if (!action || !target_user_id || typeof target_user_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing action or target_user_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (target_user_id === callerId && (action === 'delete' || action === 'suspend')) {
      return new Response(JSON.stringify({ error: 'Cannot perform this action on your own account' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let result: any = { ok: true };

    switch (action) {
      case 'activate': {
        // Manually confirm email for users who can't verify
        const { error } = await admin.auth.admin.updateUserById(target_user_id, { email_confirm: true });
        if (error) throw error;
        break;
      }
      case 'suspend': {
        // Ban for ~100 years
        const { error } = await admin.auth.admin.updateUserById(target_user_id, { ban_duration: '876000h' });
        if (error) throw error;
        break;
      }
      case 'unsuspend': {
        const { error } = await admin.auth.admin.updateUserById(target_user_id, { ban_duration: 'none' });
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await admin.auth.admin.deleteUser(target_user_id);
        if (error) throw error;
        break;
      }
      case 'set_role': {
        const allowed = ['ecowarrior', 'ecodeveloper', 'admin'];
        if (!allowed.includes(role)) {
          return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        // Replace all roles for this user with the new single role
        await admin.from('user_roles').delete().eq('user_id', target_user_id);
        const { error } = await admin.from('user_roles').insert({ user_id: target_user_id, role });
        if (error) throw error;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('admin-user-actions error:', e);
    return new Response(JSON.stringify({ error: e?.message ?? 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});