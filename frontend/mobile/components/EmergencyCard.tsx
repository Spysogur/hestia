import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { Emergency, EmergencySeverity, EmergencyStatus } from "@/lib/types";

interface Props {
  emergency: Emergency;
  onPress?: () => void;
}

const severityColor: Record<EmergencySeverity, string> = {
  [EmergencySeverity.LOW]: Colors.success,
  [EmergencySeverity.MEDIUM]: Colors.warning,
  [EmergencySeverity.HIGH]: Colors.orange500,
  [EmergencySeverity.CRITICAL]: Colors.danger,
};

const statusColor: Record<EmergencyStatus, string> = {
  [EmergencyStatus.ACTIVE]: Colors.danger,
  [EmergencyStatus.RESOLVED]: Colors.success,
  [EmergencyStatus.ESCALATED]: Colors.orange500,
};

const typeEmoji: Record<string, string> = {
  FIRE: "🔥",
  FLOOD: "🌊",
  EARTHQUAKE: "🏔️",
  MEDICAL: "🏥",
  STORM: "⛈️",
  CHEMICAL: "⚗️",
  INFRASTRUCTURE: "🏗️",
  OTHER: "⚠️",
};

export default function EmergencyCard({ emergency, onPress }: Props) {
  const handlePress = onPress ?? (() => router.push(`/emergency/${emergency.id}`));

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{typeEmoji[emergency.type] ?? "⚠️"}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {emergency.title}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor[emergency.status] + "22" }]}>
          <Text style={[styles.badgeText, { color: statusColor[emergency.status] }]}>
            {emergency.status}
          </Text>
        </View>
      </View>

      {emergency.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {emergency.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={[styles.severityDot, { backgroundColor: severityColor[emergency.severity] }]} />
        <Text style={styles.meta}>{emergency.severity}</Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.meta}>{emergency.type}</Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.meta}>
          {new Date(emergency.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navy800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.navy700,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    color: Colors.gray400,
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  meta: {
    color: Colors.gray500,
    fontSize: 12,
  },
  separator: {
    color: Colors.gray600,
    marginHorizontal: 6,
    fontSize: 12,
  },
});
