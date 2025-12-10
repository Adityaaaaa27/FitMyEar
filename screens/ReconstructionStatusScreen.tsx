import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { MainStackParamList } from "@/navigation/MainNavigator";

// 🔹 NEW: Firestore-based uploads
import {
  listenToUserUploads,
  EarUpload,
} from "@/services/dbService";

type ReconstructionStatusScreenProps = {
  navigation: NativeStackNavigationProp<
    MainStackParamList,
    "ReconstructionStatus"
  >;
};

type StepKey = "queued" | "processing" | "completed";

const STEPS: {
  key: StepKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "queued", label: "Queued", icon: "clock" },
  { key: "processing", label: "Processing", icon: "cpu" },
  { key: "completed", label: "Completed", icon: "check-circle" },
];

// 🔹 Local Job type derived from Firestore uploads
type JobStatus = "queued" | "processing" | "completed" | "failed";

type Job = {
  id: string;
  status: JobStatus;
  progress: number; // 0–100
  completedAt: number | null;
  errorMessage?: string;
};

export default function ReconstructionStatusScreen({
  navigation,
}: ReconstructionStatusScreenProps) {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pulseScale = useSharedValue(1);
  const insets = useSafeAreaInsets();
  const TOP_EXTRA = 70;

  // 🔹 Map Firestore EarUpload → Job
  const mapUploadToJob = (upload: EarUpload): Job => {
  let status: JobStatus;
  let progress = 0;

  switch (upload.status) {
    case "pending":
      status = "queued";
      progress = 10;
      break;

    case "processing":
      status = "processing";
      progress = 60;
      break;

    case "done":
      status = "completed";
      progress = 100;
      break;

    case "failed":
    default:
      status = "failed";
      progress = 0;
      break;
  }

  const completedAt =
    upload.status === "done" &&
    (upload.createdAt as any)?.toMillis
      ? (upload.createdAt as any).toMillis()
      : null;

  return {
    id: upload.id || "unknown",
    status,
    progress,
    completedAt,
    errorMessage:
      upload.status === "failed"
        ? "An error occurred during processing."
        : undefined,
  };
};


  // 🔹 Subscribe to Firestore uploads for this user
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = listenToUserUploads(user.id, (uploads) => {
      if (!uploads || uploads.length === 0) {
        setJob(null);
        setIsLoading(false);
        return;
      }

      // pick latest upload by createdAt
      const sorted = [...uploads].sort((a, b) => {
        const ta = (a.createdAt as any)?.toMillis
          ? (a.createdAt as any).toMillis()
          : 0;
        const tb = (b.createdAt as any)?.toMillis
          ? (b.createdAt as any).toMillis()
          : 0;
        return tb - ta;
      });

      const latest = sorted[0];
      const j = mapUploadToJob(latest);
      setJob(j);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Pulse animation for processing state
  useEffect(() => {
    if (job?.status === "processing") {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [job?.status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const getStepStatus = (stepKey: StepKey) => {
    if (!job) return "pending";

    const stepOrder: StepKey[] = ["queued", "processing", "completed"];
    const currentStatus = job.status === "failed" ? "processing" : job.status;
    const currentIndex = stepOrder.indexOf(currentStatus as StepKey);
    const stepIndex = stepOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString();
  };

  // -------------------------------
  // LOADING STATE
  // -------------------------------
  if (isLoading) {
    return (
      <ScreenScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + TOP_EXTRA },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      </ScreenScrollView>
    );
  }

  // -------------------------------
  // EMPTY STATE (NO JOB)
  // -------------------------------
  if (!job) {
    return (
      <ScreenScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + TOP_EXTRA },
        ]}
      >
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="inbox" size={48} color="#CCC" />
          </View>

          <ThemedText type="h4" style={styles.emptyTitle}>
            No Active Reconstruction
          </ThemedText>

          <ThemedText type="body" style={styles.emptyText}>
            Upload ear photos to start the 3D reconstruction process
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("Upload")}
          >
            <Feather name="camera" size={20} color={BrandColors.white} />
            <ThemedText
              type="body"
              style={styles.startButtonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Start Capturing
            </ThemedText>
          </Pressable>
        </View>
      </ScreenScrollView>
    );
  }

  // -------------------------------
  // MAIN SCREEN
  // -------------------------------
  return (
    <ScreenScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + TOP_EXTRA },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h3" style={styles.title}>
          3D Reconstruction
        </ThemedText>

        <ThemedText type="body" style={styles.subtitle}>
          {job.status === "completed"
            ? "Your ear model is ready!"
            : job.status === "failed"
            ? "Processing encountered an issue"
            : "Processing your ear photos..."}
        </ThemedText>
      </View>

      {job.status !== "completed" && job.progress > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${job.progress}%` },
              ]}
            />
          </View>
          <ThemedText type="small" style={styles.progressText}>
            {job.progress}% complete
          </ThemedText>
        </View>
      )}

      {/* STEPS */}
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          const isLast = index === STEPS.length - 1;

          return (
            <View key={step.key} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <Animated.View
                  style={[
                    styles.stepCircle,
                    stepStatus === "completed" && styles.stepCircleCompleted,
                    stepStatus === "active" && styles.stepCircleActive,
                    stepStatus === "active" && pulseStyle,
                  ]}
                >
                  {stepStatus === "completed" ? (
                    <Feather name="check" size={20} color={BrandColors.white} />
                  ) : (
                    <Feather
                      name={step.icon}
                      size={20}
                      color={
                        stepStatus === "active"
                          ? BrandColors.white
                          : "#CCC"
                      }
                    />
                  )}
                </Animated.View>

                {!isLast && (
                  <View
                    style={[
                      styles.stepLine,
                      stepStatus === "completed" && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepContent}>
                <ThemedText
                  type="h4"
                  style={[
                    styles.stepLabel,
                    stepStatus === "pending" && styles.stepLabelPending,
                  ]}
                >
                  {step.label}
                </ThemedText>

                {stepStatus === "active" &&
                  step.key === "processing" && (
                    <ThemedText type="small" style={styles.stepDescription}>
                      Analyzing ear geometry and creating 3D model...
                    </ThemedText>
                  )}

                {stepStatus === "completed" &&
                  step.key === "completed" && (
                    <ThemedText type="small" style={styles.stepDescription}>
                      Completed at {formatDate(job.completedAt)}
                    </ThemedText>
                  )}
              </View>
            </View>
          );
        })}
      </View>

      {/* COMPLETED SCREEN */}
      {job.status === "completed" && (
        <View style={styles.completedSection}>
          <Pressable
            style={({ pressed }) => [
              styles.modelPreview,
              pressed && styles.modelPreviewPressed,
            ]}
            onPress={() =>
              navigation.navigate("ModelViewer", { jobId: job.id } as any)
            }
          >
            <View style={styles.modelPlaceholder}>
              <Feather name="box" size={48} color={BrandColors.primaryBlue} />
              <ThemedText type="body" style={styles.modelPlaceholderText}>
                3D Model Ready
              </ThemedText>
              <ThemedText type="small" style={styles.modelPlaceholderSubtext}>
                Tap to view your ear reconstruction
              </ThemedText>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.viewModelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() =>
              navigation.navigate("ModelViewer", { jobId: job.id } as any)
            }
          >
            <Feather name="eye" size={20} color={BrandColors.darkText} />
            <ThemedText
              type="body"
              style={styles.viewModelButtonText}
              lightColor={BrandColors.darkText}
              darkColor={BrandColors.darkText}
            >
              View 3D Model
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.orderButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() =>
              navigation.navigate("CreateOrder", { jobId: job.id } as any)
            }
          >
            <Feather name="shopping-cart" size={20} color={BrandColors.white} />
            <ThemedText
              type="body"
              style={styles.orderButtonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Order Custom Ear Piece
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <ThemedText
              type="body"
              style={styles.secondaryButtonText}
              lightColor={BrandColors.primaryBlue}
              darkColor={BrandColors.primaryBlue}
            >
              Back to Dashboard
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* FAILED */}
      {job.status === "failed" && (
        <View style={styles.errorSection}>
          <View style={styles.errorCard}>
            <Feather name="alert-circle" size={24} color="#DC3545" />
            <ThemedText type="body" style={styles.errorText}>
              {job.errorMessage ||
                "An error occurred during processing. Please try again."}
            </ThemedText>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("Upload")}
          >
            <Feather name="refresh-cw" size={20} color={BrandColors.white} />
            <ThemedText
              type="body"
              style={styles.retryButtonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Try Again
            </ThemedText>
          </Pressable>
        </View>
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
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: BrandColors.darkText,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "#666",
  },
  progressSection: {
    marginBottom: Spacing["2xl"],
  },
  progressBar: {
    height: 8,
    backgroundColor: BrandColors.lightBackground,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: 4,
  },
  progressText: {
    color: "#666",
    textAlign: "right",
  },
  stepsContainer: {
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
  },
  stepIndicator: {
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  stepCircleActive: {
    backgroundColor: BrandColors.primaryBlue,
    borderColor: BrandColors.primaryBlue,
  },
  stepCircleCompleted: {
    backgroundColor: BrandColors.primaryBlue,
    borderColor: BrandColors.primaryBlue,
  },
  stepLine: {
    width: 3,
    height: 50,
    backgroundColor: "#E0E0E0",
  },
  stepLineCompleted: {
    backgroundColor: BrandColors.primaryBlue,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing["3xl"],
  },
  stepLabel: {
    color: BrandColors.darkText,
    marginBottom: Spacing.xs,
  },
  stepLabelPending: {
    color: "#999",
  },
  stepDescription: {
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BrandColors.lightBackground,
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
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    paddingHorizontal: Spacing["2xl"],
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.md,
  },
  startButtonText: {
    fontWeight: "600",
  },
  completedSection: {
    marginTop: Spacing["2xl"],
    gap: Spacing.lg,
  },
  modelPreview: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: BrandColors.lightBackground,
    borderWidth: 2,
    borderColor: BrandColors.primaryBlue,
    borderStyle: "dashed",
  },
  modelPreviewPressed: {
    opacity: 0.8,
  },
  modelPlaceholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  modelPlaceholderText: {
    color: BrandColors.primaryBlue,
    fontWeight: "600",
  },
  modelPlaceholderSubtext: {
    color: "#666",
  },
  viewModelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.highlightYellow,
    borderRadius: BorderRadius.md,
  },
  viewModelButtonText: {
    fontWeight: "600",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.md,
  },
  orderButtonText: {
    fontWeight: "600",
  },
  secondaryButton: {
    height: Spacing.buttonHeight,
    backgroundColor: "transparent",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BrandColors.primaryBlue,
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
  errorSection: {
    marginTop: Spacing["2xl"],
    gap: Spacing.lg,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: "#FFF5F5",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  errorText: {
    flex: 1,
    color: "#DC3545",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
