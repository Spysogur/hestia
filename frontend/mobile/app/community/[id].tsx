import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { communitiesApi, emergenciesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import { Community, Emergency } from "@/lib/types";
import EmergencyCard from "@/components/EmergencyCard";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, updateUser } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState(false);

  const isMember = user?.communityId === id;

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [comm, emgs] = await Promise.all([
        communitiesApi.get(id),
        emergenciesApi.active(id),
      ]);
      setCommunity(comm);
      setEmergencies(emgs);
    } catch {
      Alert.alert("Error", "Failed to load community");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const updatedUser = await communitiesApi.join(id!);
      updateUser({ ...user!, communityId: id });
      Alert.alert("Success", "You joined the community!");
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.orange500} />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors.danger }}>Community not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: Colors.orange500 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.orange500} />}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: Colors.orange500, fontSize: 15, marginBottom: 12 }}>← Back</Text>
      </TouchableOpacity>

      {/* Community Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{community.name}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <View style={[styles.badge, { backgroundColor: community.isActive ? Colors.teal500 + "30" : Colors.gray600 + "30" }]}>
            <Text style={[styles.badgeText, { color: community.isActive ? Colors.teal500 : Colors.gray500 }]}>
              {community.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: Colors.navy700 }]}>
            <Text style={[styles.badgeText, { color: Colors.gray200 }]}>
              {community.memberCount} members
            </Text>
          </View>
        </View>
        <Text style={styles.description}>{community.description}</Text>
        <Text style={styles.meta}>📍 {community.region}, {community.country} • {community.radius}km radius</Text>
      </View>

      {/* Join Button */}
      {!isMember && (
        <TouchableOpacity
          style={[styles.joinBtn, joining && { opacity: 0.5 }]}
          onPress={handleJoin}
          disabled={joining}
        >
          <Text style={styles.joinText}>{joining ? "Joining..." : "🤝 Join Community"}</Text>
        </TouchableOpacity>
      )}

      {isMember && (
        <View style={styles.memberBadge}>
          <Text style={styles.memberText}>✅ You are a member</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>{emergencies.length}</Text>
          <Text style={styles.statLabel}>Active Emergencies</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: Colors.teal500 }]}>{community.memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
      </View>

      {/* Emergencies */}
      <Text style={styles.sectionTitle}>🚨 Active Emergencies</Text>
      {emergencies.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>All clear — no active emergencies</Text>
        </View>
      ) : (
        emergencies.map((e) => <EmergencyCard key={e.id} emergency={e} />)
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy950 },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  name: { color: Colors.white, fontSize: 24, fontWeight: "700" },
  description: { color: Colors.gray400, fontSize: 14, marginTop: 10 },
  meta: { color: Colors.gray500, fontSize: 13, marginTop: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  joinBtn: {
    backgroundColor: Colors.orange500, borderRadius: 12,
    padding: 16, alignItems: "center", marginBottom: 16,
  },
  joinText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  memberBadge: {
    backgroundColor: Colors.teal500 + "20", borderWidth: 1, borderColor: Colors.teal500 + "40",
    borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 16,
  },
  memberText: { color: Colors.teal500, fontSize: 15, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  stat: {
    flex: 1, backgroundColor: Colors.navy800, borderWidth: 1, borderColor: Colors.navy700,
    borderRadius: 12, padding: 16,
  },
  statValue: { fontSize: 28, fontWeight: "700" },
  statLabel: { color: Colors.gray400, fontSize: 12, marginTop: 4 },
  sectionTitle: { color: Colors.white, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  empty: {
    backgroundColor: Colors.navy800, borderWidth: 1, borderColor: Colors.navy700,
    borderRadius: 12, padding: 30, alignItems: "center",
  },
  emptyText: { color: Colors.gray500, fontSize: 14 },
});
