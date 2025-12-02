import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { OrderAPI, Order } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { MainStackParamList } from "@/navigation/MainNavigator";
import { useScreenInsets } from "@/hooks/useScreenInsets";

type OrderHistoryScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "OrderHistory">;
};

const STATUS_CONFIG: Record<Order["status"], { label: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  pending: { label: "Pending", color: "#FFA500", icon: "clock" },
  confirmed: { label: "Confirmed", color: BrandColors.primaryBlue, icon: "check" },
  manufacturing: { label: "Manufacturing", color: "#9B59B6", icon: "tool" },
  shipped: { label: "Shipped", color: "#3498DB", icon: "truck" },
  delivered: { label: "Delivered", color: "#27AE60", icon: "check-circle" },
  cancelled: { label: "Cancelled", color: "#DC3545", icon: "x-circle" },
};

const EAR_PIECE_NAMES: Record<Order["earPieceType"], string> = {
  standard: "Standard",
  premium: "Premium",
  medical: "Medical Grade",
};

export default function OrderHistoryScreen({
  navigation,
}: OrderHistoryScreenProps) {
  const { user } = useAuth();
  const { paddingTop, paddingBottom, paddingHorizontal } = useScreenInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      const userOrders = await OrderAPI.getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          pressed && styles.orderCardPressed,
        ]}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View>
            <ThemedText type="body" style={styles.orderId}>
              {item.id}
            </ThemedText>
            <ThemedText type="small" style={styles.orderDate}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
            <Feather name={statusConfig.icon} size={14} color={statusConfig.color} />
            <ThemedText
              type="small"
              style={[styles.statusText, { color: statusConfig.color }]}
            >
              {statusConfig.label}
            </ThemedText>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Feather name="headphones" size={16} color="#666" />
            <ThemedText type="body" style={styles.detailText}>
              {EAR_PIECE_NAMES[item.earPieceType]} x {item.quantity}
            </ThemedText>
          </View>
          <ThemedText type="h4" style={styles.orderPrice}>
            ${item.price.toFixed(2)}
          </ThemedText>
        </View>

        {item.trackingNumber && (
          <View style={styles.trackingRow}>
            <Feather name="package" size={14} color="#666" />
            <ThemedText type="small" style={styles.trackingText}>
              Tracking: {item.trackingNumber}
            </ThemedText>
          </View>
        )}

        {item.estimatedDelivery && item.status !== "delivered" && item.status !== "cancelled" && (
          <View style={styles.deliveryRow}>
            <Feather name="calendar" size={14} color="#666" />
            <ThemedText type="small" style={styles.deliveryText}>
              Est. Delivery: {formatDate(item.estimatedDelivery)}
            </ThemedText>
          </View>
        )}
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, { paddingTop, paddingHorizontal }]}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="shopping-bag" size={48} color="#CCC" />
          </View>
          <ThemedText type="h4" style={styles.emptyTitle}>
            No Orders Yet
          </ThemedText>
          <ThemedText type="body" style={styles.emptyText}>
            Complete a 3D reconstruction to order your custom ear pieces
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("CameraCapture")}
          >
            <Feather name="camera" size={20} color={BrandColors.white} />
            <ThemedText
              type="body"
              style={styles.emptyButtonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Start Capturing
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      renderItem={renderOrder}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        { paddingTop, paddingBottom, paddingHorizontal },
      ]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.lightBackground,
  },
  listContent: {
    paddingTop: Spacing["2xl"],
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  orderCard: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  orderCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  orderId: {
    color: BrandColors.darkText,
    fontWeight: "600",
  },
  orderDate: {
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontWeight: "600",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailText: {
    color: "#666",
  },
  orderPrice: {
    color: BrandColors.primaryBlue,
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  trackingText: {
    color: "#666",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  deliveryText: {
    color: "#666",
  },
  separator: {
    height: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    color: BrandColors.darkText,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    paddingHorizontal: Spacing["2xl"],
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.md,
  },
  emptyButtonText: {
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
