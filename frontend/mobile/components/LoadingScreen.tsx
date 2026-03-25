import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Colors } from "@/constants/colors";

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.navy950,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color={Colors.orange500} />
      <Text style={{ color: Colors.gray400, fontSize: 14 }}>{message}</Text>
    </View>
  );
}
