import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { Community } from "@/lib/types";

interface Props {
  community: Community;
  onPress?: () => void;
  showJoin?: boolean;
  onJoin?: () => void;
  isJoined?: boolean;
}

export default function CommunityCard({
  community,
  onPress,
  showJoin,
  onJoin,
  isJoined,
}: Props) {
  const handlePress = onPress ?? (() => router.push(`/community/${community.id}`));

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🏘️</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {community.name}
        </Text>
        {community.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {community.description}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {community.memberCount ?? 0} members
          </Text>
          {community.radius ? (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.metaText}>{community.radius}km radius</Text>
            </>
          ) : null}
        </View>
      </View>
      {showJoin && !isJoined && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          style={styles.joinBtn}
        >
          <Text style={styles.joinBtnText}>Join</Text>
        </TouchableOpacity>
      )}
      {isJoined && (
        <View style={styles.joinedBadge}>
          <Text style={styles.joinedText}>Joined</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navy800,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.navy700,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy700,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  name: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  description: {
    color: Colors.gray400,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: Colors.gray500,
    fontSize: 11,
  },
  dot: {
    color: Colors.gray600,
    marginHorizontal: 4,
    fontSize: 11,
  },
  joinBtn: {
    backgroundColor: Colors.orange500,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8,
  },
  joinBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
  joinedBadge: {
    backgroundColor: Colors.success + "22",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  joinedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "600",
  },
});
