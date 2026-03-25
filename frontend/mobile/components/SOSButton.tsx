import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";

interface Props {
  onPress: () => void;
}

export default function SOSButton({ onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.outerRing, { transform: [{ scale }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
          activeOpacity={0.9}
        >
          <Text style={styles.label}>SOS</Text>
          <Text style={styles.sub}>Tap to activate emergency</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 20,
  },
  outerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.danger + "55",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 4,
  },
  sub: {
    color: Colors.white + "cc",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
});
