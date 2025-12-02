import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { OrderAPI, Order } from "@/services/api";
import { MainStackParamList } from "@/navigation/MainNavigator";

type OrderDetailScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "OrderDetail">;
  route: RouteProp<MainStackParamList, "OrderDetail">;
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

const STATUS_ORDER: Order["status"][] = [
  "pending",
  "confirmed",
  "manufacturing",
  "shipped",
  "delivered",
];

export default function OrderDetailScreen({
  navigation,
  route,
}: OrderDetailScreenProps) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await OrderAPI.getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error("Failed to load order:", error);
      Alert.alert("Error", "Failed to load order details");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "No, Keep Order", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              const updatedOrder = await OrderAPI.cancelOrder(orderId);
              setOrder(updatedOrder);
            } catch (error) {
              Alert.alert("Error", "Failed to cancel order. Please try again.");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      </ScreenScrollView>
    );
  }

  if (!order) {
    return (
      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#DC3545" />
          <ThemedText type="h4" style={styles.errorText}>
            Order not found
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="h3" style={styles.orderId}>
          {order.id}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
          <Feather name={statusConfig.icon} size={16} color={statusConfig.color} />
          <ThemedText
            type="body"
            style={[styles.statusText, { color: statusConfig.color }]}
          >
            {statusConfig.label}
          </ThemedText>
        </View>
      </View>

      {order.status !== "cancelled" && (
        <View style={styles.progressSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Order Progress
          </ThemedText>
          <View style={styles.progressContainer}>
            {STATUS_ORDER.map((status, index) => {
              const config = STATUS_CONFIG[status];
              const isPast = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isLast = index === STATUS_ORDER.length - 1;

              return (
                <View key={status} style={styles.progressStep}>
                  <View style={styles.progressIndicator}>
                    <View
                      style={[
                        styles.progressCircle,
                        isPast && styles.progressCircleCompleted,
                        isCurrent && styles.progressCircleCurrent,
                      ]}
                    >
                      {isPast ? (
                        <Feather name="check" size={14} color={BrandColors.white} />
                      ) : (
                        <Feather
                          name={config.icon}
                          size={14}
                          color={isCurrent ? BrandColors.white : "#CCC"}
                        />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.progressLine,
                          isPast && styles.progressLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <ThemedText
                    type="small"
                    style={[
                      styles.progressLabel,
                      (isPast || isCurrent) && styles.progressLabelActive,
                    ]}
                  >
                    {config.label}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Order Details
        </ThemedText>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <ThemedText type="body" style={styles.detailLabel}>
              Product
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {EAR_PIECE_NAMES[order.earPieceType]} Ear Piece
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="body" style={styles.detailLabel}>
              Quantity
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {order.quantity}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="body" style={styles.detailLabel}>
              Order Date
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {formatShortDate(order.createdAt)}
            </ThemedText>
          </View>
          {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
            <View style={styles.detailRow}>
              <ThemedText type="body" style={styles.detailLabel}>
                Est. Delivery
              </ThemedText>
              <ThemedText type="body" style={styles.detailValue}>
                {formatShortDate(order.estimatedDelivery)}
              </ThemedText>
            </View>
          )}
          {order.trackingNumber && (
            <View style={styles.detailRow}>
              <ThemedText type="body" style={styles.detailLabel}>
                Tracking
              </ThemedText>
              <ThemedText type="body" style={styles.detailValueHighlight}>
                {order.trackingNumber}
              </ThemedText>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <ThemedText type="h4" style={styles.totalLabel}>
              Total
            </ThemedText>
            <ThemedText type="h4" style={styles.totalValue}>
              ${order.price.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      </View>

      {order.shippingAddress && (
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Shipping Address
          </ThemedText>
          <View style={styles.addressCard}>
            <Feather name="map-pin" size={20} color={BrandColors.primaryBlue} />
            <View style={styles.addressContent}>
              <ThemedText type="body" style={styles.addressName}>
                {order.shippingAddress.name}
              </ThemedText>
              <ThemedText type="body" style={styles.addressLine}>
                {order.shippingAddress.street}
              </ThemedText>
              <ThemedText type="body" style={styles.addressLine}>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </ThemedText>
              <ThemedText type="body" style={styles.addressLine}>
                {order.shippingAddress.country}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {canCancel && (
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.buttonPressed,
            isCancelling && styles.buttonDisabled,
          ]}
          onPress={handleCancelOrder}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <ActivityIndicator color="#DC3545" />
          ) : (
            <>
              <Feather name="x-circle" size={20} color="#DC3545" />
              <ThemedText type="body" style={styles.cancelButtonText}>
                Cancel Order
              </ThemedText>
            </>
          )}
        </Pressable>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Spacing["2xl"],
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
    gap: Spacing.lg,
  },
  errorText: {
    color: "#DC3545",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  orderId: {
    color: BrandColors.darkText,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    fontWeight: "600",
  },
  progressSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    color: BrandColors.darkText,
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStep: {
    flex: 1,
    alignItems: "center",
  },
  progressIndicator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: Spacing.sm,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    zIndex: 1,
  },
  progressCircleCurrent: {
    backgroundColor: BrandColors.primaryBlue,
    borderColor: BrandColors.primaryBlue,
  },
  progressCircleCompleted: {
    backgroundColor: BrandColors.primaryBlue,
    borderColor: BrandColors.primaryBlue,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginLeft: -2,
  },
  progressLineCompleted: {
    backgroundColor: BrandColors.primaryBlue,
  },
  progressLabel: {
    color: "#999",
    fontSize: 10,
    textAlign: "center",
  },
  progressLabelActive: {
    color: BrandColors.darkText,
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  detailCard: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  detailLabel: {
    color: "#666",
  },
  detailValue: {
    color: BrandColors.darkText,
    fontWeight: "500",
  },
  detailValueHighlight: {
    color: BrandColors.primaryBlue,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.md,
  },
  totalLabel: {
    color: BrandColors.darkText,
  },
  totalValue: {
    color: BrandColors.primaryBlue,
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    color: BrandColors.darkText,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  addressLine: {
    color: "#666",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "#DC3545",
  },
  cancelButtonText: {
    color: "#DC3545",
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
