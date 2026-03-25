import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { communitiesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import { Community } from "@/lib/types";
import CommunityCard from "@/components/CommunityCard";

type Tab = "all" | "nearby";

export default function CommunitiesScreen() {
  const { user, updateUser } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [nearby, setNearby] = useState<Community[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const data = await communitiesApi.list();
      setCommunities(data);
    } catch {
      Alert.alert("Error", "Could not load communities.");
    }
  }, []);

  const fetchNearby = useCallback(async () => {
    setNearbyLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required for nearby communities.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const data = await communitiesApi.nearby(
        loc.coords.latitude,
        loc.coords.longitude,
        100
      );
      setNearby(data);
    } catch {
      Alert.alert("Error", "Could not load nearby communities.");
    } finally {
      setNearbyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  useEffect(() => {
    if (activeTab === "nearby") {
      fetchNearby();
    }
  }, [activeTab, fetchNearby]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === "all") {
      await fetchAll();
    } else {
      await fetchNearby();
    }
    setRefreshing(false);
  }, [activeTab, fetchAll, fetchNearby]);

  const handleJoin = async (community: Community) => {
    setJoiningId(community.id);
    try {
      const updatedUser = await communitiesApi.join(community.id);
      updateUser(updatedUser);
      Alert.alert("Joined!", `You've joined ${community.name}.`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not join community.";
      Alert.alert("Error", message);
    } finally {
      setJoiningId(null);
    }
  };

  const list = activeTab === "all" ? communities : nearby;
  const filtered = list.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {(["all", "nearby"] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "all" ? "All" : "📍 Nearby"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search communities..."
          placeholderTextColor={Colors.gray500}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.orange500}
          />
        }
      >
        {loading || nearbyLoading ? (
          <ActivityIndicator color={Colors.orange500} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{activeTab === "nearby" ? "📍" : "🏘️"}</Text>
            <Text style={styles.emptyText}>
              {activeTab === "nearby"
                ? "No communities nearby"
                : "No communities found"}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "nearby"
                ? "Try expanding your search radius"
                : "Be the first to create one!"}
            </Text>
          </View>
        ) : (
          filtered.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              showJoin
              isJoined={user?.communityId === c.id}
              onJoin={() =>
                joiningId === c.id ? undefined : handleJoin(c)
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy950 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.navy900,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navy700,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 0,
  },
  tabActive: {
    backgroundColor: Colors.orange500 + "22",
    borderBottomWidth: 2,
    borderBottomColor: Colors.orange500,
    borderRadius: 0,
  },
  tabText: { color: Colors.gray400, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: Colors.orange500 },
  searchContainer: {
    padding: 12,
    backgroundColor: Colors.navy900,
  },
  searchInput: {
    backgroundColor: Colors.navy800,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.navy700,
    color: Colors.white,
    fontSize: 14,
    padding: 11,
    paddingLeft: 14,
  },
  scroll: { padding: 16, paddingBottom: 32 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: { color: Colors.gray400, fontSize: 13 },
});
