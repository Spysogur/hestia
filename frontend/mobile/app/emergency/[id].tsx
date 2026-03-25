import React, { useCallback, useEffect, useState } from "react";
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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { emergenciesApi, helpApi } from "@/lib/api";
import { Colors, Severity } from "@/constants/colors";
import {
  Emergency,
  HelpRequest,
  HelpOffer,
  HelpType,
  HelpRequestPriority,
  HelpOfferStatus,
} from "@/lib/types";
import HelpRequestCard from "@/components/HelpRequestCard";
import HelpOfferCard from "@/components/HelpOfferCard";

const HELP_TYPES = Object.values(HelpType);
const PRIORITIES = Object.values(HelpRequestPriority);

export default function EmergencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"requests" | "offers">("requests");
  const [requestModal, setRequestModal] = useState(false);
  const [offerModal, setOfferModal] = useState(false);

  // Request form
  const [reqType, setReqType] = useState(HelpType.OTHER);
  const [reqPriority, setReqPriority] = useState(HelpRequestPriority.MEDIUM);
  const [reqTitle, setReqTitle] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [reqPeople, setReqPeople] = useState("1");

  // Offer form
  const [offType, setOffType] = useState(HelpType.OTHER);
  const [offDesc, setOffDesc] = useState("");
  const [offCapacity, setOffCapacity] = useState("1");

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      const [em, reqs, offs] = await Promise.all([
        emergenciesApi.get(id),
        helpApi.getRequests(id),
        helpApi.getOffers(id),
      ]);
      setEmergency(em);
      setRequests(reqs);
      setOffers(offs);
    } catch {
      Alert.alert("Error", "Failed to load emergency details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleResolve = () => {
    Alert.alert("Resolve", "Mark this emergency as resolved?", [
      { text: "Cancel" },
      {
        text: "Resolve",
        onPress: async () => {
          try {
            await emergenciesApi.resolve(id!);
            fetchAll();
          } catch { Alert.alert("Error", "Failed to resolve"); }
        },
      },
    ]);
  };

  const handleEscalate = async () => {
    try {
      await emergenciesApi.escalate(id!);
      fetchAll();
    } catch { Alert.alert("Error", "Failed to escalate"); }
  };

  const handleAutoMatch = async () => {
    try {
      const result: any = await helpApi.autoMatch(id!);
      Alert.alert("Auto-Match", `Matched ${result?.matches?.length ?? 0} pairs`);
      fetchAll();
    } catch { Alert.alert("Error", "Auto-match failed"); }
  };

  const submitRequest = async () => {
    if (!reqTitle || !reqDesc) return Alert.alert("Error", "Fill in all fields");
    try {
      await helpApi.createRequest({
        emergencyId: id!,
        type: reqType,
        priority: reqPriority,
        title: reqTitle,
        description: reqDesc,
        latitude: emergency?.latitude ?? 0,
        longitude: emergency?.longitude ?? 0,
        numberOfPeople: parseInt(reqPeople) || 1,
      });
      setRequestModal(false);
      setReqTitle(""); setReqDesc("");
      fetchAll();
    } catch { Alert.alert("Error", "Failed to create request"); }
  };

  const submitOffer = async () => {
    if (!offDesc) return Alert.alert("Error", "Fill in description");
    try {
      await helpApi.createOffer({
        emergencyId: id!,
        type: offType,
        description: offDesc,
        latitude: emergency?.latitude ?? 0,
        longitude: emergency?.longitude ?? 0,
        capacity: parseInt(offCapacity) || 1,
      });
      setOfferModal(false);
      setOffDesc("");
      fetchAll();
    } catch { Alert.alert("Error", "Failed to create offer"); }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.orange500} />
      </View>
    );
  }

  if (!emergency) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors.danger, fontSize: 16 }}>Emergency not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: Colors.orange500 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sevColor = Severity[emergency.severity] ?? Colors.gray400;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={Colors.orange500} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: Colors.orange500, fontSize: 15 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{emergency.title}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <View style={[styles.badge, { backgroundColor: sevColor + "30" }]}>
              <Text style={[styles.badgeText, { color: sevColor }]}>{emergency.severity}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: Colors.navy700 }]}>
              <Text style={[styles.badgeText, { color: Colors.gray200 }]}>{emergency.type}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: emergency.status === "ACTIVE" ? Colors.danger + "30" : Colors.success + "30" }]}>
              <Text style={[styles.badgeText, { color: emergency.status === "ACTIVE" ? Colors.danger : Colors.success }]}>{emergency.status}</Text>
            </View>
          </View>
          <Text style={styles.description}>{emergency.description}</Text>
          <Text style={styles.meta}>Radius: {emergency.radiusKm}km</Text>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.warning + "20", borderColor: Colors.warning + "40" }]} onPress={handleEscalate}>
            <Text style={[styles.actionText, { color: Colors.warning }]}>⬆ Escalate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.teal500 + "20", borderColor: Colors.teal500 + "40" }]} onPress={handleResolve}>
            <Text style={[styles.actionText, { color: Colors.teal500 }]}>✓ Resolve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.orange500 + "20", borderColor: Colors.orange500 + "40" }]} onPress={handleAutoMatch}>
            <Text style={[styles.actionText, { color: Colors.orange500 }]}>⚡ Match</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === "requests" && styles.tabActive]} onPress={() => setTab("requests")}>
            <Text style={[styles.tabText, tab === "requests" && styles.tabTextActive]}>Requests ({requests.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === "offers" && styles.tabActive]} onPress={() => setTab("offers")}>
            <Text style={[styles.tabText, tab === "offers" && styles.tabTextActive]}>Offers ({offers.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Add buttons */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.orange500 }]} onPress={() => setRequestModal(true)}>
            <Text style={styles.addBtnText}>+ Need Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.teal500 }]} onPress={() => setOfferModal(true)}>
            <Text style={styles.addBtnText}>+ Offer Help</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {tab === "requests"
          ? requests.map((r) => <HelpRequestCard key={r.id} request={r} />)
          : offers.map((o) => <HelpOfferCard key={o.id} offer={o} />)}

        {(tab === "requests" ? requests : offers).length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {tab} yet</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Request Modal */}
      <Modal visible={requestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Help</Text>
            <ScrollView>
              <Text style={styles.label}>Type</Text>
              <View style={styles.chipRow}>
                {HELP_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={[styles.chip, reqType === t && styles.chipActive]} onPress={() => setReqType(t)}>
                    <Text style={[styles.chipText, reqType === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.chipRow}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity key={p} style={[styles.chip, reqPriority === p && styles.chipActive]} onPress={() => setReqPriority(p)}>
                    <Text style={[styles.chipText, reqPriority === p && styles.chipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={reqTitle} onChangeText={setReqTitle} placeholder="Brief title" placeholderTextColor={Colors.gray500} />
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 80 }]} value={reqDesc} onChangeText={setReqDesc} placeholder="Details..." placeholderTextColor={Colors.gray500} multiline />
              <Text style={styles.label}>People</Text>
              <TextInput style={styles.input} value={reqPeople} onChangeText={setReqPeople} keyboardType="numeric" placeholderTextColor={Colors.gray500} />
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.navy700 }]} onPress={() => setRequestModal(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.orange500, flex: 1 }]} onPress={submitRequest}>
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Offer Modal */}
      <Modal visible={offerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Offer Help</Text>
            <Text style={styles.label}>Type</Text>
            <View style={styles.chipRow}>
              {HELP_TYPES.map((t) => (
                <TouchableOpacity key={t} style={[styles.chip, offType === t && styles.chipActive]} onPress={() => setOffType(t)}>
                  <Text style={[styles.chipText, offType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80 }]} value={offDesc} onChangeText={setOffDesc} placeholder="What can you provide..." placeholderTextColor={Colors.gray500} multiline />
            <Text style={styles.label}>Capacity</Text>
            <TextInput style={styles.input} value={offCapacity} onChangeText={setOffCapacity} keyboardType="numeric" placeholderTextColor={Colors.gray500} />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.navy700 }]} onPress={() => setOfferModal(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.teal500, flex: 1 }]} onPress={submitOffer}>
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy950 },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  title: { color: Colors.white, fontSize: 24, fontWeight: "700", marginTop: 8 },
  description: { color: Colors.gray400, fontSize: 14, marginTop: 8 },
  meta: { color: Colors.gray500, fontSize: 13, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  actionText: { fontSize: 13, fontWeight: "600" },
  tabRow: { flexDirection: "row", backgroundColor: Colors.navy800, borderRadius: 10, padding: 4, marginBottom: 12 },
  tabBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  tabActive: { backgroundColor: Colors.orange500 },
  tabText: { color: Colors.gray400, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: Colors.white },
  addBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: "center" },
  addBtnText: { color: Colors.white, fontWeight: "600", fontSize: 14 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: Colors.gray500, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: Colors.navy900, borderRadius: 16, padding: 20, maxHeight: "80%" },
  modalTitle: { color: Colors.white, fontSize: 20, fontWeight: "700", marginBottom: 16 },
  label: { color: Colors.gray400, fontSize: 13, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: Colors.navy800, borderWidth: 1, borderColor: Colors.navy700,
    borderRadius: 8, padding: 12, color: Colors.white, fontSize: 14,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: Colors.navy700, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  chipActive: { backgroundColor: Colors.orange500 },
  chipText: { color: Colors.gray400, fontSize: 12 },
  chipTextActive: { color: Colors.white },
  modalBtn: { borderRadius: 10, padding: 14, alignItems: "center" },
  modalBtnText: { color: Colors.white, fontWeight: "600", fontSize: 15 },
});
