/*
 * NEXO cloud connection.
 * This publishable key is intended for browser use. Row Level Security in
 * Supabase is what protects each account's campaign data.
 */
(() => {
  const url = 'https://xyzxblgcalwdhquggxgg.supabase.co';
  const publishableKey = 'sb_publishable_9Mhg2KwP4n8Q_h80H1AZfQ_B05KgaKm';
  if (!window.supabase?.createClient) return;
  window.nexoSupabaseClient = window.supabase.createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
