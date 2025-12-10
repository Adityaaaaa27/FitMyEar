import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { MainStackParamList } from "@/navigation/MainNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "Settings">;
};

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function SettingsItem({
  icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
}: SettingsItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        pressed && styles.settingsItemPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.settingsIcon,
          danger && styles.settingsIconDanger,
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={danger ? "#FF3B30" : BrandColors.primaryBlue}
        />
      </View>
      <ThemedText
        type="body"
        style={[styles.settingsLabel, danger && styles.settingsLabelDanger]}
      >
        {label}
      </ThemedText>
      {showChevron && (
        <Feather name="chevron-right" size={20} color="#CCC" />
      )}
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();


  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Data",
      "This will delete all your captured photos and reconstruction data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            const { PhotoStorage, ReconstructionStorage } = await import(
              "@/utils/storage"
            );
            await PhotoStorage.clearPhotos();
            await ReconstructionStorage.clearStatus();
            Alert.alert("Success", "All data has been cleared");
          },
        },
      ],
    );
  };

  return (
    <ScreenScrollView
  contentContainerStyle={[
    styles.scrollContent,
    { paddingTop: insets.top + 80
 }  // Add extra padding
  ]}
>

      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Feather name="user" size={32} color={BrandColors.primaryBlue} />
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h4" style={styles.profileEmail}>
            {user?.email || "user@example.com"}
          </ThemedText>
          <ThemedText type="small" style={styles.profileLabel}>
            Account
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={styles.sectionTitle}>
          APP SETTINGS
        </ThemedText>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="bell"
            label="Notifications"
            onPress={() =>
              Alert.alert("Notifications", "Coming soon")
            }
          />
          <SettingsItem
            icon="lock"
            label="Privacy"
            onPress={() => Alert.alert("Privacy", "Coming soon")}
          />
          <SettingsItem
            icon="help-circle"
            label="Help & Support"
            onPress={() =>
              Alert.alert("Help", "Contact support@fitmyear.com")
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={styles.sectionTitle}>
          DATA
        </ThemedText>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="trash-2"
            label="Clear All Data"
            onPress={handleClearData}
            showChevron={false}
            danger
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={styles.sectionTitle}>
          ACCOUNT
        </ThemedText>
        <View style={styles.sectionContent}>
          <Pressable
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
            onPress={handleSignOut}
          >
            <Feather name="log-out" size={20} color={BrandColors.darkText} />
            <ThemedText type="body" style={styles.signOutText}>
              Sign Out
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" style={styles.footerText}>
          FitMyEar v1.0.0
        </ThemedText>
        <ThemedText type="small" style={styles.footerText}>
          Made with care for your ears
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Spacing["2xl"],
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["2xl"],
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    color: BrandColors.darkText,
    marginBottom: Spacing.xs,
  },
  profileLabel: {
    color: "#999",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    color: "#999",
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.lightBackground,
  },
  settingsItemPressed: {
    backgroundColor: BrandColors.lightBackground,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingsIconDanger: {
    backgroundColor: "#FFEBEA",
  },
  settingsLabel: {
    flex: 1,
    color: BrandColors.darkText,
  },
  settingsLabelDanger: {
    color: "#FF3B30",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: BrandColors.highlightYellow,
  },
  signOutButtonPressed: {
    opacity: 0.9,
  },
  signOutText: {
    color: BrandColors.darkText,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    gap: Spacing.xs,
  },
  footerText: {
    color: "#999",
  },
});
