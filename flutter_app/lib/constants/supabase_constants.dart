class SupabaseConstants {
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://raezmmfgjkrivybtmptv.supabase.co',
  );
  
  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'sb_publishable_0TCylslSTj9s6PjDyTbbrQ_mIQY_egz',
  );
}
