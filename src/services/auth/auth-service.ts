import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';

import { supabase, isSupabaseConfigured } from '@/services/supabase/supabase-client';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = Linking.createURL('auth-callback');

async function createSessionFromUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token: accessToken, refresh_token: refreshToken } = params;
  if (!accessToken || !refreshToken || !supabase) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  if (error) throw error;

  return data.session;
}

// Opens Google's consent screen in a browser tab and completes the OAuth code exchange
// via the app's redirect URI (works in Expo Go and in standalone/dev builds alike).
export async function signInWithGoogle(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado (faltan variables de entorno).');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true }
  });
  if (error) throw error;
  if (!data.url) throw new Error('No se recibió la URL de autenticación de Google.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return null;

  return createSessionFromUrl(result.url);
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
