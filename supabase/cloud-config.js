/*
 * NEXO cloud connection.
 * This publishable key is intended for browser use. Row Level Security in
 * Supabase is what protects each account's campaign data.
 */
(() => {
  const url = 'https://mwghqthduedupttjlkmm.supabase.co';
  const publishableKey = 'sb_publishable_N9PJ8t4TB73kJrjO-2b9LA_R7lTTVDa';
  if (!window.supabase?.createClient) return;
  window.nexoSupabaseClient = window.supabase.createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
