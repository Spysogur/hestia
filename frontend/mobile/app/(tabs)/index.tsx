import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { emergenciesApi } from "@/lib/api";
import { getSignalRConnection, onEmergencyEvent } from "@/lib/signalr";
import { Colors } from "@/constants/colors";
import {
  ActivateEmergencyPayload,
  Emergency,
  EmergencySeverity,
  EmergencyStatus,
  EmergencyType,
} from "@/lib/types";
import EmergencyCard from "@/components/EmergencyCard";
import SOSButton from "@/components/SOSButton";

const EMERGENCY_TYPES = Object.values(EmergencyType);
const SEVERITY_LEVELS = Object.values(EmergencySeverity);

export default function DashboardScreen() {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);

  // SOS form state
  const [sosTitle, setSosTitle] = useState("");
  const [sosDesc, setSosDesc] = useState("");
  const [sosType, setSosType] = useState<EmergencyType>(EmergencyType.OTHER);
  const [sosSeverity, setSosSeverity] = useState<EmergencySeverity>(EmergencySeverity.HIGH);
  const [sosLoading, setSosLoading] = useState(false);

  const signalRCleanups = useRef<Array<() => void>>([]);

  const fetchEmergencies = useCallback(async () => {
    try {
      const data = await emergenciesApi.active(user?.communityId);
      setEmergencies(data);
    } catch {
      // Silently handle network errors on refresh
    }
  }, [user?.communityId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEmergencies();
    setRefreshing(false);
  }, [fetchEmergencies]);

  useEffect(() => {
    fetchEmergencies().finally(() => setLoading(false));
  }, [fetchEmergencies]);

  // SignalR real-time updates
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getSignalRConnection();
        if (!mounted) return;
        const cleanups = [
          onEmergencyEvent("EmergencyActivated", () => fetchEmergencies()),
          onEmergencyEvent("EmergencyResolved", () => fetchEmergencies()),
          onEmergencyEvent("EmergencyEscalated", () => fetchEmergencies()),
        ];
        signalRCleanups.current = cleanups;
      } catch {
        // SignalR optional — app works without it
      }
    })();
    return () => {
      mounted = false;
      signalRCleanups.current.forEach((fn) => fn());
    };
  }, [fetchEmergencies]);

  const handleActivateEmergency = async () => {
    if (!sosTitle.trim()) {
      Alert.alert("Missing Info", "Please provide a title.");
      return;
    }
    if (!user?.communityId) {
      Alert.alert("No Community", "Join a community first to activate an emergency.");
      return;
    }
    setSosLoading(true);
    try {
      const payload: ActivateEmergencyPayload = {
        title: sosTitle.trim(),
        description: sosDesc.trim() || undefined,
        type: sosType,
        severity: sosSeverity,
        communityId: user.communityId,
      };
      await emergenciesApi.activate(payload);
      setSosVisible(false);
      setSosTitle("");
      setSosDesc("");
      setSosType(EmergencyType.OTHER);
      setSosSeverity(EmergencySeverity.HIGH);
      await fetchEmergencies();
      Alert.alert("Emergency Activated", "Community has been notified.");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to activate emergency.";
      Alert.alert("Error", message);
    } finally {
      setSosLoading(false);
    }
  };

  const activeCount = emergencies.filter(
    (e) => e.status === EmergencyStatus.ACTIVE
  ).length;

  return (
    <View style={styles.container}>
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
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.greeting}>
            Hello, {user?.fullName?.split(" ")[0] ?? "Responder"} 👋
          </Text>
          <Text style={styles.subtitle}>Stay safe and help your community</Text>
        </View>

        {/* Community Status */}
        <View style={styles.section}>
          {user?.communityId ? (
            <View style={styles.communityBadge}>
              <Text style={styles.communityText}>🏘️ Community Member</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.joinPrompt}
              onPress={() => router.push("/(tabs)/communities")}
            >
              <Text style={styles.joinPromptText}>
                📍 Join a community to see local emergencies →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active Emergencies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{emergencies.length}</Text>
            <Text style={styles.statLabel}>Total Incidents</Text>
          </View>
        </View>

        {/* SOS Button */}
        <SOSButton onPress={() => setSosVisible(true)} />

        {/* Active Emergencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Emergencies</Text>
          {loading ? (
            <ActivityIndicator color={Colors.orange500} style={{ marginTop: 20 }} />
          ) : emergencies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✅</Text>
              <Text style={styles.emptyText}>No active emergencies</Text>
              <Text style={styles.emptySubtext}>Your community is safe right now</Text>
            </View>
          ) : (
            emergencies.map((e) => <EmergencyCard key={e.id} emergency={e} />)
          )}
        </View>
      </ScrollView>

      {/* SOS Modal */}
      <Modal visible={sosVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🚨 Activate Emergency</Text>

            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={sosTitle}
              onChangeText={setSosTitle}
              placeholder="Brief emergency title"
              placeholderTextColor={Colors.gray500}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={sosDesc}
              onChangeText={setSosDesc}
              placeholder="What's happening? (optional)"
              placeholderTextColor={Colors.gray500}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {EMERGENCY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, sosType === t && styles.chipActive]}
                  onPress={() => setSosType(t)}
                >
                  <Text style={[styles.chipText, sosType === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Severity</Text>
            <View style={styles.severityRow}>
              {SEVERITY_LEVELS.map((s) => {
                const colors: Record<EmergencySeverity, string> = {
                  LOW: Colors.success,
                  MEDIUM: Colors.warning,
                  HIGH: Colors.orange500,
                  CRITICAL: Colors.danger,
                };
                const isSelected = sosSeverity === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.severityChip,
                      { borderColor: colors[s] },
                      isSelected && { backgroundColor: colors[s] },
                    ]}
                    onPress={() => setSosSeverity(s)}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: isSelected ? Colors.white : colors[s] },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSosVisible(false)}
                disabled={sosLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.activateBtn, sosLoading && { opacity: 0.7 }]}
                onPress={handleActivateEmergency}
                disabled={sosLoading}
              >
                {sosLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.activateBtnText}>Activate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy950 },
  scroll: { padding: 16, paddingBottom: 32 },
  headerCard: {
    backgroundColor: Colors.navy800,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.navy700,
  },
  greeting: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: { color: Colors.gray400, fontSize: 13 },
  section: { marginBottom: 16 },
  communityBadge: {
    backgroundColor: Colors.teal500 + "22",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.teal500 + "44",
  },
  communityText: { color: Colors.teal500, fontSize: 14, fontWeight: "600" },
  joinPrompt: {
    backgroundColor: Colors.orange500 + "22",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.orange500 + "44",
  },
  joinPromptText: { color: Colors.orange400, fontSize: 13, fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.navy800,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.navy700,
  },
  statNumber: {
    color: Colors.orange500,
    fontSize: 32,
    fontWeight: "900",
  },
  statLabel: {
    color: Colors.gray400,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: Colors.navy800,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.navy700,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: { color: Colors.gray400, fontSize: 13 },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000088",
  },
  modalContainer: {
    backgroundColor: Colors.navy800,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Colors.navy700,
    maxHeight: "90%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.navy600,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  fieldLabel: {
    color: Colors.gray400,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: Colors.navy900,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.navy700,
    color: Colors.white,
    fontSize: 14,
    padding: 12,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  chipRow: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.navy700,
    marginRight: 8,
    marginVertical: 4,
  },
  chipActive: { backgroundColor: Colors.orange500 },
  chipText: { color: Colors.gray400, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: Colors.white },
  severityRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
    flexWrap: "wrap",
  },
  severityChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 2,
  },
  severityText: { fontSize: 12, fontWeight: "700" },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.navy700,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  cancelBtnText: {
    color: Colors.gray300,
    fontSize: 15,
    fontWeight: "600",
  },
  activateBtn: {
    flex: 1,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  activateBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
