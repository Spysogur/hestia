import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { HelpRequest, HelpRequestStatus } from "@/lib/types";

interface Props {
  request: HelpRequest;
}

const statusColor: Record<HelpRequestStatus, string> = {
  [HelpRequestStatus.PENDING]: Colors.warning,
  [HelpRequestStatus.MATCHED]: Colors.teal500,
  [HelpRequestStatus.FULFILLED]: Colors.success,
};

export default function HelpRequestCard({ request }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{request.requestType}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor[request.status] + "22" }]}>
          <Text style={[styles.badgeText, { color: statusColor[request.status] }]}>
            {request.status}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{request.description}</Text>
      <Text style={styles.time}>
        {new Date(request.createdAt).toLocaleString()}
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
    borderLeftColor: Colors.warning,
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
