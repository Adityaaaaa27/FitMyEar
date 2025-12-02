import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { EarModelViewer } from "@/components/EarModelViewer";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { ReconstructionAPI, ReconstructionJob } from "@/services/api";
import { MainStackParamList } from "@/navigation/MainNavigator";

type ModelViewerScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "ModelViewer">;
  route: RouteProp<MainStackParamList, "ModelViewer">;
};

export default function ModelViewerScreen({
  navigation,
  route,
}: ModelViewerScreenProps) {
  const { jobId } = route.params;
  const [job, setJob] = useState<ReconstructionJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const jobData = await ReconstructionAPI.getJob(jobId);
      if (!jobData || jobData.status !== "completed") {
        Alert.alert(
          "Model Not Ready",
          "The 3D model is not yet available. Please wait for processing to complete.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }
      setJob(jobData);
    } catch (error) {
      Alert.alert("Error", "Failed to load model data");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderPress = () => {
    if (job) {
      navigation.navigate("CreateOrder", { jobId: job.id });
    }
  };

  if (isLoading) {
    return (
      <ScreenScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
          <ThemedText type="body" style={styles.loadingText}>
            Loading 3D model...
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="h3" style={styles.title}>
          Your Ear Model
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          3D reconstruction complete - ready for custom fitting
        </ThemedText>
      </View>

      <EarModelViewer
        modelId={job.modelUrl || undefined}
        onOrderPress={handleOrderPress}
        showControls={true}
      />

      <View style={styles.detailsSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Model Details
        </ThemedText>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <ThemedText type="body" style={styles.detailLabel}>
              Model ID
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {job.id.slice(0, 12)}...
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="body" style={styles.detailLabel}>
              Created
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {new Date(job.completedAt || job.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="body" style={styles.detailLabel}>
              Photos Used
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              {job.photoIds.length}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="body" style={styles.detailLabel}>
              Status
            </ThemedText>
            <View style={styles.statusBadge}>
              <ThemedText type="small" style={styles.statusText}>
                Ready
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          What's Next?
        </ThemedText>
        <View style={styles.infoCard}>
          <ThemedText type="body" style={styles.infoText}>
            Your personalized ear model has been created using advanced 3D reconstruction technology. 
            This model will be used to manufacture custom-fit ear pieces that perfectly match your ear geometry.
          </ThemedText>
          <ThemedText type="body" style={styles.infoText}>
            Click "Order Custom Ear Piece" above to proceed with your order.
          </ThemedText>
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
    gap: Spacing.lg,
  },
  loadingText: {
    color: "#666",
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
  detailsSection: {
    marginTop: Spacing["2xl"],
  },
  sectionTitle: {
    color: BrandColors.darkText,
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    color: "#666",
  },
  detailValue: {
    color: BrandColors.darkText,
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: "rgba(39, 174, 96, 0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    color: "#27AE60",
    fontWeight: "600",
  },
  infoSection: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  infoCard: {
    backgroundColor: "rgba(26, 92, 255, 0.05)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(26, 92, 255, 0.1)",
  },
  infoText: {
    color: "#666",
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
});
