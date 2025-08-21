import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CustomAlert({ type = "success", message, onConfirm }) {
  const [visible, setVisible] = useState(true);
  const scaleAnim = new Animated.Value(0.8);

  const isSuccess = type === "success";
  const colors = {
    bg: isSuccess ? "#2563EB" : "#DC2626", 
    badge: isSuccess ? "#3B82F6" : "#EF4444",
    emoji: isSuccess ? "🎉" : "❌",
    title: isSuccess ? "Success!" : "Error!",
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}} // disables Android back button close
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: colors.bg, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Badge Icon */}
          <View style={[styles.badge, { backgroundColor: colors.badge }]}>
            <Text style={styles.badgeEmoji}>{colors.emoji}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{colors.title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setVisible(false);
              onConfirm && onConfirm();
            }}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", // vertical center
    alignItems: "center",     // horizontal center
  },
  container: {
    width: width * 0.8,        // 80% of screen width
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 12,
  },
  buttonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 15,
  },
});
