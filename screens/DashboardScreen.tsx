import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/navigation/MainNavigator";
import { useAuth } from "@/hooks/useAuth";

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "Dashboard">;
};

interface DashboardCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "dark";
}

function DashboardCard({
  icon,
  title,
  description,
  onPress,
  variant = "secondary",
}: DashboardCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const getCardStyle = () => {
    switch (variant) {
      case "primary":
        return styles.cardPrimary;
      case "dark":
        return styles.cardDark;
      default:
        return styles.cardSecondary;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "primary":
      case "dark":
        return BrandColors.white;
      default:
        return BrandColors.primaryCoral;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
      case "dark":
        return BrandColors.white;
      default:
        return BrandColors.darkText;
    }
  };

  const getDescColor = () => {
    switch (variant) {
      case "primary":
      case "dark":
        return "rgba(255, 255, 255, 0.8)";
      default:
        return "#8B7B6B";
    }
  };

  return (
    <AnimatedPressable
      style={[styles.card, getCardStyle(), animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.cardContent}>
        <View style={[styles.cardIcon, variant !== "secondary" && styles.cardIconTransparent]}>
          <Feather name={icon} size={28} color={getIconColor()} />
        </View>
        <View style={styles.cardText}>
          <ThemedText type="h4" style={[styles.cardTitle, { color: getTextColor() }]}>
            {title}
          </ThemedText>
          <ThemedText type="small" style={[styles.cardDescription, { color: getDescColor() }]}>
            {description}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={24} color={variant === "secondary" ? "#CCC" : "rgba(255,255,255,0.6)"} />
      </View>
    </AnimatedPressable>
  );
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user, isAdmin } = useAuth();

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.welcomeSection}>
        <ThemedText type="h2" style={styles.welcomeTitle}>
          Welcome{user?.name ? `, ${user.name}` : ""}
        </ThemedText>
        <ThemedText type="body" style={styles.welcomeText}>
          Create your custom-fit ear pieces in 3 simple steps
        </ThemedText>
      </View>

      <View style={styles.cardsContainer}>
        <DashboardCard
          icon="camera"
          title="Open Camera"
          description="Take photos of your ear using the guided camera"
          onPress={() => navigation.navigate("CameraCapture")}
          variant="primary"
        />

        <DashboardCard
          icon="image"
          title="Upload Photo"
          description="Upload ear photos from your gallery"
          onPress={() => navigation.navigate("Upload")}
          variant="secondary"
        />

        <DashboardCard
          icon="activity"
          title="3D Reconstruction Status"
          description="Track your ear model processing progress"
          onPress={() => navigation.navigate("ReconstructionStatus")}
          variant="dark"
        />

        {isAdmin && (
          <DashboardCard
            icon="bar-chart-2"
            title="Admin Dashboard"
            description="View system statistics and manage orders"
            onPress={() => navigation.navigate("AdminDashboard")}
            variant="secondary"
          />
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.settingsButton,
          pressed && styles.settingsButtonPressed,
        ]}
        onPress={() => navigation.navigate("Settings")}
      >
        <Feather name="settings" size={20} color={BrandColors.darkText} />
        <ThemedText type="body" style={styles.settingsButtonText}>
          Settings
        </ThemedText>
      </Pressable>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Spacing["3xl"],
  },
  welcomeSection: {
    marginBottom: Spacing["2xl"],
  },
  welcomeTitle: {
    color: BrandColors.darkText,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    color: "#8B7B6B",
  },
  cardsContainer: {
    gap: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  cardPrimary: {
    backgroundColor: BrandColors.primaryCoral,
  },
  cardSecondary: {
    backgroundColor: BrandColors.white,
    borderWidth: 2,
    borderColor: BrandColors.primaryCoral,
  },
  cardDark: {
    backgroundColor: BrandColors.primaryDark,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  cardIconTransparent: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {},
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["3xl"],
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  settingsButtonPressed: {
    opacity: 0.7,
  },
  settingsButtonText: {
    color: BrandColors.darkText,
  },
});
