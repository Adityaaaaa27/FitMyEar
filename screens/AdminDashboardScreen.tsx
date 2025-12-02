import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { AdminAPI, OrderAPI, ReconstructionAPI, Order, ReconstructionJob } from "@/services/api";
import { MainStackParamList } from "@/navigation/MainNavigator";

type AdminDashboardScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "AdminDashboard">;
};

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <ThemedText type="h3" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function AdminDashboardScreen({
  navigation,
}: AdminDashboardScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalOrders: 0,
    pendingJobs: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingJobs, setPendingJobs] = useState<ReconstructionJob[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [dashStats, orders, jobs] = await Promise.all([
        AdminAPI.getDashboardStats(),
        OrderAPI.getAllOrders(),
        ReconstructionAPI.getAllJobs(),
      ]);

      setStats(dashStats);
      setRecentOrders(orders.slice(0, 5));
      setPendingJobs(jobs.filter((j) => j.status === "queued" || j.status === "processing").slice(0, 5));
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
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

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="h3" style={styles.title}>
          Admin Dashboard
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          System overview and management
        </ThemedText>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="users"
          label="Total Users"
          value={stats.totalUsers}
          color={BrandColors.primaryBlue}
        />
        <StatCard
          icon="box"
          label="Total Jobs"
          value={stats.totalJobs}
          color="#9B59B6"
        />
        <StatCard
          icon="shopping-bag"
          label="Total Orders"
          value={stats.totalOrders}
          color="#27AE60"
        />
        <StatCard
          icon="dollar-sign"
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          color={BrandColors.highlightYellow}
        />
      </View>

      <View style={styles.alertsRow}>
        {stats.pendingJobs > 0 && (
          <View style={styles.alertBadge}>
            <Feather name="clock" size={14} color="#FFA500" />
            <ThemedText type="small" style={styles.alertText}>
              {stats.pendingJobs} jobs processing
            </ThemedText>
          </View>
        )}
        {stats.pendingOrders > 0 && (
          <View style={styles.alertBadge}>
            <Feather name="package" size={14} color={BrandColors.primaryBlue} />
            <ThemedText type="small" style={styles.alertText}>
              {stats.pendingOrders} pending orders
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Processing Jobs
          </ThemedText>
          <ThemedText type="small" style={styles.sectionCount}>
            {pendingJobs.length} active
          </ThemedText>
        </View>

        {pendingJobs.length > 0 ? (
          <View style={styles.listContainer}>
            {pendingJobs.map((job) => (
              <View key={job.id} style={styles.listItem}>
                <View style={styles.listItemIcon}>
                  <Feather
                    name={job.status === "processing" ? "cpu" : "clock"}
                    size={18}
                    color={job.status === "processing" ? "#9B59B6" : "#FFA500"}
                  />
                </View>
                <View style={styles.listItemContent}>
                  <ThemedText type="body" style={styles.listItemTitle}>
                    Job {job.id.slice(0, 8)}...
                  </ThemedText>
                  <ThemedText type="small" style={styles.listItemSubtitle}>
                    {job.progress}% - {job.status}
                  </ThemedText>
                </View>
                <ThemedText type="small" style={styles.listItemTime}>
                  {formatDate(job.createdAt)}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptySection}>
            <Feather name="check-circle" size={24} color="#27AE60" />
            <ThemedText type="body" style={styles.emptyText}>
              No pending jobs
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Recent Orders
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("OrderHistory")}>
            <ThemedText type="small" style={styles.viewAllLink}>
              View All
            </ThemedText>
          </Pressable>
        </View>

        {recentOrders.length > 0 ? (
          <View style={styles.listContainer}>
            {recentOrders.map((order) => (
              <Pressable
                key={order.id}
                style={({ pressed }) => [
                  styles.listItem,
                  pressed && styles.listItemPressed,
                ]}
                onPress={() => navigation.navigate("OrderDetail", { orderId: order.id })}
              >
                <View style={styles.listItemIcon}>
                  <Feather name="shopping-bag" size={18} color={BrandColors.primaryBlue} />
                </View>
                <View style={styles.listItemContent}>
                  <ThemedText type="body" style={styles.listItemTitle}>
                    {order.id}
                  </ThemedText>
                  <ThemedText type="small" style={styles.listItemSubtitle}>
                    {order.status} - {formatCurrency(order.price)}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color="#CCC" />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptySection}>
            <Feather name="inbox" size={24} color="#CCC" />
            <ThemedText type="body" style={styles.emptyText}>
              No orders yet
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => navigation.navigate("OrderHistory")}
          >
            <Feather name="list" size={24} color={BrandColors.primaryBlue} />
            <ThemedText type="small" style={styles.actionLabel}>
              All Orders
            </ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={loadData}
          >
            <Feather name="refresh-cw" size={24} color={BrandColors.primaryBlue} />
            <ThemedText type="small" style={styles.actionLabel}>
              Refresh
            </ThemedText>
          </Pressable>
        </View>
      </View>
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
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    color: BrandColors.darkText,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "#666",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "47%",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    color: BrandColors.darkText,
    marginBottom: 2,
  },
  statLabel: {
    color: "#666",
  },
  alertsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  alertText: {
    color: "#666",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: BrandColors.darkText,
  },
  sectionCount: {
    color: "#666",
  },
  viewAllLink: {
    color: BrandColors.primaryBlue,
    fontWeight: "600",
  },
  listContainer: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  listItemPressed: {
    backgroundColor: BrandColors.lightBackground,
  },
  listItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: BrandColors.darkText,
    fontWeight: "500",
  },
  listItemSubtitle: {
    color: "#666",
    marginTop: 2,
  },
  listItemTime: {
    color: "#999",
  },
  emptySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.xl,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  emptyText: {
    color: "#666",
  },
  actionsSection: {
    marginBottom: Spacing.xl,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.xl,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  actionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  actionLabel: {
    color: BrandColors.darkText,
    fontWeight: "500",
  },
});
