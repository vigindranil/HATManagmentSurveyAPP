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

import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Lock,
  Zap,
  AlertTriangle,
  ClipboardX,
  SearchX,
  HelpCircle,
  Bell,
} from 'lucide-react-native';

import { Colors, useTheme } from "@/context/theme-context";

const { width } = Dimensions.get("window");

export default function CustomAlert({ type = "success", message, onConfirm, onCancel }: { type?: string; message: string; onConfirm?: () => void; onCancel?: () => void }) {
  const { isDarkMode, theme } = useTheme();
  const activeColors = Colors[theme];
  const [visible, setVisible] = useState(true);
  const scaleAnim = new Animated.Value(0.8);

  let colors;
  let IconComponent;

  switch (type) {
    case "success":
      colors = {
        bg: isDarkMode ? "#064E3B" : "#F0FDF4",
        text: isDarkMode ? "#D1FAE5" : "#15803D",
        border: "#22C55E",
        badge: "#10B981",
        title: "Success",
      };
      IconComponent = CheckCircle2;
      break;
    case "error":
      colors = {
        bg: isDarkMode ? "#450A0A" : "#FEF2F2",
        text: isDarkMode ? "#FECACA" : "#B91C1C",
        border: "#EF4444",
        badge: "#EF4444",
        title: "Error",
      };
      IconComponent = XCircle;
      break;
    case "Invalid":
      colors = {
        bg: isDarkMode ? "#451A03" : "#FFFBEB",
        text: isDarkMode ? "#FDE68A" : "#B45309",
        border: "#F59E0B",
        badge: "#F59E0B",
        title: "Invalid",
      };
      IconComponent = AlertCircle;
      break;
    case "Permission Denied":
      colors = {
        bg: isDarkMode ? "#450A0A" : "#FEF2F2",
        text: isDarkMode ? "#FECACA" : "#B91C1C",
        border: "#DC2626",
        badge: "#DC2626",
        title: "Denied",
      };
      IconComponent = ShieldAlert;
      break;
    case "Unauthorized":
      colors = {
        bg: isDarkMode ? "#450A0A" : "#FEF2F2",
        text: isDarkMode ? "#FECACA" : "#B91C1C",
        border: "#B91C1C",
        badge: "#B91C1C",
        title: "Locked",
      };
      IconComponent = Lock;
      break;
    case "Autofill Successful":
      colors = {
        bg: isDarkMode ? "#064E3B" : "#F0FDF4",
        text: isDarkMode ? "#D1FAE5" : "#15803D",
        border: "#22C55E",
        badge: "#059669",
        title: "Autofill",
      };
      IconComponent = Zap;
      break;
    case "Something went Wrong":
      colors = {
        bg: isDarkMode ? "#450A0A" : "#FEF2F2",
        text: isDarkMode ? "#FECACA" : "#B91C1C",
        border: "#EF4444",
        badge: "#EF4444",
        title: "Error",
      };
      IconComponent = XCircle;
      break;
    case "Survey Failure":
      colors = {
        bg: isDarkMode ? "#450A0A" : "#FEF2F2",
        text: isDarkMode ? "#FECACA" : "#B91C1C",
        border: "#EF4444",
        badge: "#E11D48",
        title: "Failed",
      };
      IconComponent = ClipboardX;
      break;
    case "User Not Found":
      colors = {
        bg: isDarkMode ? "#3F2B0B" : "#FFFBEB",
        text: isDarkMode ? "#FEF3C7" : "#854D0E",
        border: "#D97706",
        badge: "#D97706",
        title: "Not Found",
      };
      IconComponent = SearchX;
      break;
    case "User Details Unavailable":
      colors = {
        bg: isDarkMode ? "#171717" : "#F5F5F5",
        text: isDarkMode ? "#E5E5E5" : "#404040",
        border: "#737373",
        badge: "#737373",
        title: "Unavailable",
      };
      IconComponent = HelpCircle;
      break;
    case "notfound":
    case "not_found":
      colors = {
        bg: isDarkMode ? "#3F2B0B" : "#FFFBEB",
        text: isDarkMode ? "#FEF3C7" : "#854D0E",
        border: "#D97706",
        badge: "#D97706",
        title: "Not Found",
      };
      IconComponent = SearchX;
      break;
    default:
      colors = {
        bg: isDarkMode ? "#171717" : "#F8FAFC",
        text: isDarkMode ? "#F5F5F5" : "#1E293B",
        border: "#64748B",
        badge: "#64748B",
        title: typeof type === "string" ? type.charAt(0).toUpperCase() + type.slice(1) : "Notice",
      };
      IconComponent = Bell;
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
      onRequestClose={() => { }}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.bg,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.border + '30',
              borderWidth: 2,
              transform: [{ scale: scaleAnim }]
            },
          ]}
        >
          {/* Badge Icon */}
          <View style={[styles.badge, { backgroundColor: colors.badge }]}>
            <IconComponent size={34} color="#ffffff" strokeWidth={2.5} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{colors.title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            {typeof onCancel === 'function' && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', marginRight: 12 }]}
                onPress={() => {
                  setVisible(false);
                  onCancel && onCancel();
                }}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.badge }]}
              onPress={() => {
                setVisible(false);
                onConfirm && onConfirm();
              }}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>OK</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    borderRadius: 24,
    padding: 24,
    paddingTop: 45, // Increased padding to accommodate overlapping badge
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    position: 'relative', // Ensure relative positioning for absolute badge
    marginTop: 35, // Add margin to avoid badge clipping at screen top
  },
  badge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    position: 'absolute',
    top: -35, // Overlap the container
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)', // White border for the badge itself
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
  },
});
