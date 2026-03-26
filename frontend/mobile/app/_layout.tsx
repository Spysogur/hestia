import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import { Colors } from "@/constants/colors";

function RootNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Starting Hestia..." />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.navy900 },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: Colors.navy950 },
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="emergency/[id]"
          options={{ title: "Emergency Details" }}
        />
        <Stack.Screen
          name="community/[id]"
          options={{ title: "Community Details" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
