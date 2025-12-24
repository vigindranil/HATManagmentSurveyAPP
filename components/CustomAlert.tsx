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

export default function CustomAlert({ type = "success", message, onConfirm, onCancel }: { type?: string; message: string; onConfirm?: () => void; onCancel?: () => void }) {
  const [visible, setVisible] = useState(true);
  const scaleAnim = new Animated.Value(0.8);

  let colors;
  switch (type) {
    case "success":
      colors = {
        bg: "#2563EB", // Blue
        badge: "#3B82F6",
        emoji: "🎉",
        title: "Success!",
      };
      break;
    case "error":
      colors = {
        bg: "#DC2626", // Red
        badge: "#EF4444",
        emoji: "❌",
        title: "Error!",
      };
      break;
    case "Invalid":
      colors = {
        bg: "#F59E42", // Orange-ish for warning
        badge: "#FBBF24", // Amber-400
        emoji: "⚠️",
        title: "Invalid!",
      };
      break;
    case "Permission Denied":
      colors = {
        bg: "#F87171", // Light Red
        badge: "#DC2626", // Deep Red
        emoji: "🚫",
        title: "Permission Denied",
      };
      break;
    case "Unauthorized":
      colors = {
        bg: "#DC2626", // Red
        badge: "#F87171", // Light Red
        emoji: "🔒",
        title: "Unauthorized",
      };
      break;
    case "Autofill Successful":
      colors = {
        bg: "#34D399", // Green
        badge: "#10B981", // Green-600
        emoji: "🤖",
        title: "Autofill Successful",
      };
      break;
    case "Something went Wrong":
      colors = {
        bg: "#F59E42", // Orange
        badge: "#EA580C",
        emoji: "⚠️",
        title: "Something went Wrong",
      };
      break;
    case "Survey Failure":
      colors = {
        bg: "#F87171", // Light Red
        badge: "#EF4444",
        emoji: "📋",
        title: "Survey Failure",
      };
      break;
    case "User Not Found":
      colors = {
        bg: "#F59E42", // Yellow-Orange
        badge: "#FACC15",
        emoji: "🙅‍♂️",
        title: "User Not Found",
      };
      break;
    case "User Details Unavailable":
      colors = {
        bg: "#A5B4FC", // Indigo-100
        badge: "#6366F1", // Indigo-500
        emoji: "🙇‍♂️",
        title: "User Details Unavailable",
      };
      break;
    case "notfound":
    case "not_found":
      colors = {
        bg: "#FACC15",
        badge: "#e5e7eb",
        emoji: "😕",
        title: "Not Found",
      };
      break;
    default:
      colors = {
        bg: "#FACC15",
        badge: "#3B8298",
        emoji: "😕",
        title: typeof type === "string" ? type : "Notice",
      };
  }

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
      onRequestClose={() => { }} // disables Android back button close
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

          {/* Buttons Row (Single Line, Centered) */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 5 }}>
            {typeof onCancel === 'function' && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#f87171', marginRight: 12, minWidth: 90 }]}
                onPress={() => {
                  setVisible(false);
                  onCancel && onCancel();
                }}
              >
                <Text style={[styles.buttonText, { color: '#fff', textAlign: 'center' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { minWidth: 90 }]}
              onPress={() => {
                setVisible(false);
                onConfirm && onConfirm();
              }}
            >
              <Text style={[styles.buttonText, { textAlign: 'center' }]}>OK</Text>
            </TouchableOpacity>
          </View>
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
