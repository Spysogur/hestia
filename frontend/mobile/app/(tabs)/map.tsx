import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import * as Location from "expo-location";
import { router } from "expo-router";
import { emergenciesApi, helpApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import {
  Emergency,
  EmergencyStatus,
  EmergencySeverity,
  HelpRequest,
  HelpOffer,
} from "@/lib/types";

interface MarkerInfo {
  kind: "emergency" | "help_request" | "help_offer";
  data: Emergency | HelpRequest | HelpOffer;
}

const severityColor: Record<EmergencySeverity, string> = {
  LOW: Colors.success,
  MEDIUM: Colors.warning,
  HIGH: Colors.orange500,
  CRITICAL: Colors.danger,
};

export default function MapScreen() {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [helpOffers, setHelpOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MarkerInfo | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const activeEmergencies = await emergenciesApi.active(user?.communityId);
      setEmergencies(activeEmergencies);

      // Load help data for all active emergencies
      const allRequests: HelpRequest[] = [];
      const allOffers: HelpOffer[] = [];
      await Promise.allSettled(
        activeEmergencies.map(async (e) => {
          const [reqs, offs] = await Promise.all([
            helpApi.getRequests(e.id),
            helpApi.getOffers(e.id),
          ]);
          allRequests.push(...reqs);
          allOffers.push(...offs);
        })
      );
      setHelpRequests(allRequests);
      setHelpOffers(allOffers);
    } catch {
      // Silent fail
    }
  }, [user?.communityId]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(coords);
        setRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  const centerOnUser = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        { ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        500
      );
    } else {
      Alert.alert("Location Unavailable", "Could not get your current location.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.orange500} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
      >
        {/* Emergency markers */}
        {emergencies
          .filter((e) => e.latitude && e.longitude && e.status === EmergencyStatus.ACTIVE)
          .map((e) => (
            <Marker
              key={`emergency-${e.id}`}
              coordinate={{ latitude: e.latitude!, longitude: e.longitude! }}
              onPress={() => setSelected({ kind: "emergency", data: e })}
            >
              <View style={[styles.markerContainer, { backgroundColor: severityColor[e.severity] }]}>
                <Text style={styles.markerEmoji}>🔴</Text>
              </View>
            </Marker>
          ))}

        {/* Help request markers */}
        {helpRequests
          .filter((r) => r.latitude && r.longitude)
          .map((r) => (
            <Marker
              key={`request-${r.id}`}
              coordinate={{ latitude: r.latitude!, longitude: r.longitude! }}
              onPress={() => setSelected({ kind: "help_request", data: r })}
            >
              <View style={[styles.markerContainer, { backgroundColor: Colors.warning }]}>
                <Text style={styles.markerEmoji}>🟠</Text>
              </View>
            </Marker>
          ))}

        {/* Help offer markers */}
        {helpOffers
          .filter((o) => o.latitude && o.longitude)
          .map((o) => (
            <Marker
              key={`offer-${o.id}`}
              coordinate={{ latitude: o.latitude!, longitude: o.longitude! }}
              onPress={() => setSelected({ kind: "help_offer", data: o })}
            >
              <View style={[styles.markerContainer, { backgroundColor: Colors.teal500 }]}>
                <Text style={styles.markerEmoji}>🟢</Text>
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={centerOnUser}>
          <Text style={styles.controlBtnText}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={fetchData}>
          <Text style={styles.controlBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={Colors.danger} label="Emergency" />
        <LegendItem color={Colors.warning} label="Help Needed" />
        <LegendItem color={Colors.teal500} label="Help Offered" />
      </View>

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setSelected(null)}
          activeOpacity={1}
        >
          <View style={styles.detailSheet}>
            <View style={styles.modalHandle} />
            {selected?.kind === "emergency" && (
              <EmergencyDetail
                emergency={selected.data as Emergency}
                onNavigate={() => {
                  setSelected(null);
                  router.push(`/emergency/${(selected.data as Emergency).id}`);
                }}
              />
            )}
            {selected?.kind === "help_request" && (
              <HelpRequestDetail request={selected.data as HelpRequest} />
            )}
            {selected?.kind === "help_offer" && (
              <HelpOfferDetail offer={selected.data as HelpOffer} />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function EmergencyDetail({
  emergency,
  onNavigate,
}: {
  emergency: Emergency;
  onNavigate: () => void;
}) {
  return (
    <>
      <Text style={styles.detailTitle}>🚨 {emergency.title}</Text>
      <Text style={styles.detailMeta}>
        {emergency.type} • {emergency.severity} • {emergency.status}
      </Text>
      {emergency.description ? (
        <Text style={styles.detailDesc}>{emergency.description}</Text>
      ) : null}
      <TouchableOpacity style={styles.detailBtn} onPress={onNavigate}>
        <Text style={styles.detailBtnText}>View Details →</Text>
      </TouchableOpacity>
    </>
  );
}

function HelpRequestDetail({ request }: { request: HelpRequest }) {
  return (
    <>
      <Text style={styles.detailTitle}>🙏 Help Needed</Text>
      <Text style={styles.detailMeta}>{request.requestType} • {request.status}</Text>
      <Text style={styles.detailDesc}>{request.description}</Text>
    </>
  );
}

function HelpOfferDetail({ offer }: { offer: HelpOffer }) {
  return (
    <>
      <Text style={styles.detailTitle}>🤝 Help Offered</Text>
      <Text style={styles.detailMeta}>{offer.offerType} • {offer.status}</Text>
      <Text style={styles.detailDesc}>{offer.description}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.navy950,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { color: Colors.gray400, fontSize: 14 },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  markerEmoji: { fontSize: 16 },
  controls: {
    position: "absolute",
    right: 16,
    bottom: 140,
    gap: 10,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy800,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.navy600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlBtnText: { fontSize: 18 },
  legend: {
    position: "absolute",
    bottom: 90,
    left: 16,
    backgroundColor: Colors.navy900 + "ee",
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.navy700,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.gray200, fontSize: 11 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000055",
  },
  detailSheet: {
    backgroundColor: Colors.navy800,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: Colors.navy700,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.navy600,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  detailTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  detailMeta: {
    color: Colors.gray400,
    fontSize: 13,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailDesc: {
    color: Colors.gray200,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailBtn: {
    backgroundColor: Colors.orange500,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 4,
  },
  detailBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f97316" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a0f1a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
];
