import React, { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Text } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  if (!isAuthenticated) return null;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.navy900 },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        tabBarStyle: {
          backgroundColor: Colors.navy900,
          borderTopColor: Colors.navy700,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: Colors.orange500,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏘️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
