import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { HelpOffer, HelpOfferStatus } from "@/lib/types";

interface Props {
  offer: HelpOffer;
}

const statusColor: Record<HelpOfferStatus, string> = {
  [HelpOfferStatus.AVAILABLE]: Colors.teal500,
  [HelpOfferStatus.MATCHED]: Colors.orange500,
  [HelpOfferStatus.COMPLETED]: Colors.success,
};

export default function HelpOfferCard({ offer }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{offer.offerType}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor[offer.status] + "22" }]}>
          <Text style={[styles.badgeText, { color: statusColor[offer.status] }]}>
            {offer.status}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{offer.description}</Text>
      <Text style={styles.time}>
        {new Date(offer.createdAt).toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navy800,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.teal500,
    borderWidth: 1,
    borderColor: Colors.navy700,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeTag: {
    backgroundColor: Colors.navy700,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: Colors.gray200,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    color: Colors.gray200,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    color: Colors.gray500,
    fontSize: 11,
  },
});
