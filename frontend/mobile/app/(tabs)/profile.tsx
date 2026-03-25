import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Contact</Text>
        <Text style={styles.cardValue}>{user.phone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏘️ Community</Text>
        <Text style={styles.cardValue}>
          {user.communityId ? `Joined (${user.communityId.slice(0, 8)}...)` : "Not joined yet"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛠️ Skills</Text>
        {user.skills && user.skills.length > 0 ? (
          <View style={styles.tagRow}>
            {user.skills.map((s, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.cardMuted}>No skills added</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Resources</Text>
        {user.resources && user.resources.length > 0 ? (
          <View style={styles.tagRow}>
            {user.resources.map((r, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{r}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.cardMuted}>No resources listed</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Verification</Text>
        <Text style={[styles.cardValue, { color: user.isVerified ? Colors.success : Colors.warning }]}>
          {user.isVerified ? "Verified" : "Not verified"}
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy950 },
  content: { padding: 20 },
  avatarContainer: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.orange500,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: "700" },
  name: { color: Colors.white, fontSize: 22, fontWeight: "700" },
  email: { color: Colors.gray400, fontSize: 14, marginTop: 4 },
  roleBadge: {
    marginTop: 8, backgroundColor: Colors.orange500 + "30",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  roleText: { color: Colors.orange500, fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: Colors.navy800, borderRadius: 12,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.navy700,
  },
  cardTitle: { color: Colors.gray400, fontSize: 13, fontWeight: "600", marginBottom: 8 },
  cardValue: { color: Colors.white, fontSize: 16 },
  cardMuted: { color: Colors.gray500, fontSize: 14, fontStyle: "italic" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: Colors.navy700, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  tagText: { color: Colors.gray200, fontSize: 13 },
  logoutButton: {
    backgroundColor: Colors.danger + "20",
    borderWidth: 1, borderColor: Colors.danger + "40",
    borderRadius: 12, padding: 16, alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: "600" },
});
