import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { Screen } from '@/components/screen';
import { useToast } from '@/lib/toast-context';
import { getSession, signInWithGoogle, signOut } from '@/services/auth/auth-service';
import { isSupabaseConfigured } from '@/services/supabase/supabase-client';
import { runSync } from '@/services/sync/sync-service';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function AccountScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getSession()
      .then(setSession)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const newSession = await signInWithGoogle();
      if (!newSession) {
        setIsLoading(false);
        return;
      }
      setSession(newSession);
      toast.success('Sesión iniciada con Google');

      setIsSyncing(true);
      const result = await runSync();
      toast.info(`Sincronizado: ${result.pushed} enviados, ${result.pulled} recibidos`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo iniciar sesión');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [toast]);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
      setSession(null);
      toast.success('Sesión cerrada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSyncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await runSync();
      toast.info(`Sincronizado: ${result.pushed} enviados, ${result.pulled} recibidos`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo sincronizar');
    } finally {
      setIsSyncing(false);
    }
  }, [toast]);

  return (
    <Screen title="Cuenta">
      <View style={{ padding: spacing[6], gap: spacing[4] }}>
        {!isSupabaseConfigured ? (
          <Text style={{ ...typography.body, color: colors.muted }}>
            La sincronización en la nube no está configurada en este build.
          </Text>
        ) : isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : session ? (
          <>
            <Text style={{ ...typography.label, color: colors.foreground }}>
              Sesión iniciada
            </Text>
            <Text style={{ ...typography.caption, color: colors.muted }}>
              {session.user.email ?? session.user.id}
            </Text>
            <Pressable
              onPress={() => void handleSyncNow()}
              disabled={isSyncing}
              style={{
                padding: spacing[4],
                borderRadius: radius.lg,
                backgroundColor: colors.secondary,
                alignItems: 'center'
              }}
            >
              {isSyncing ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={{ ...typography.label, color: colors.primary }}>
                  Sincronizar ahora
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => void handleSignOut()}
              style={{
                padding: spacing[4],
                borderRadius: radius.lg,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center'
              }}
            >
              <Text style={{ ...typography.label, color: colors.foreground }}>Cerrar sesión</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ ...typography.body, color: colors.muted }}>
              Inicia sesión con Google para sincronizar tus mascotas y tratamientos entre
              dispositivos.
            </Text>
            <Pressable
              onPress={() => void handleSignIn()}
              style={{
                padding: spacing[4],
                borderRadius: radius.lg,
                backgroundColor: colors.primary,
                alignItems: 'center'
              }}
            >
              <Text style={{ ...typography.label, color: colors.primaryForeground }}>
                Iniciar sesión con Google
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}
