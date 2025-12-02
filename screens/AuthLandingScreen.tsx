import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthNavigator";

const { width, height } = Dimensions.get("window");

type AuthLandingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "AuthLanding">;
};

export default function AuthLandingScreen({ navigation }: AuthLandingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="h4" style={styles.brandName}>
          FitMyEar
        </ThemedText>
        <Pressable style={styles.helpButton} hitSlop={10}>
          <Feather name="help-circle" size={24} color={BrandColors.warmBrown} />
        </Pressable>
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require("../assets/images/happy_people_with_ear_devices.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.waveTop} />
        
        <View style={styles.content}>
          <ThemedText type="h2" style={styles.title}>
            Perfect Fit for{"\n"}Your Ears
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            Create custom-fitted ear pieces with our advanced 3D scanning technology. 
            Comfort and precision, tailored just for you.
          </ThemedText>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => navigation.navigate("SignIn")}
            >
              <ThemedText type="body" style={styles.loginButtonText}>
                Login
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => navigation.navigate("SignUp")}
            >
              <ThemedText type="body" style={styles.signupButtonText}>
                Sign-up
              </ThemedText>
            </Pressable>
          </View>

          <Pressable style={styles.helpLink}>
            <Feather name="help-circle" size={16} color={BrandColors.white} />
            <ThemedText type="small" style={styles.helpLinkText}>
              Looking for help?
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.warmPeach,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  brandName: {
    color: BrandColors.warmBrown,
    fontWeight: "700",
  },
  helpButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  illustration: {
    width: width * 0.85,
    height: height * 0.32,
  },
  contentContainer: {
    backgroundColor: BrandColors.warmOrange,
    borderTopLeftRadius: BorderRadius["3xl"],
    borderTopRightRadius: BorderRadius["3xl"],
    overflow: "hidden",
  },
  waveTop: {
    height: 20,
    backgroundColor: BrandColors.warmOrange,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["4xl"],
    alignItems: "center",
  },
  title: {
    color: BrandColors.white,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: BrandColors.white,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  loginButton: {
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.warmCream,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: BrandColors.warmBrown,
    fontWeight: "600",
  },
  signupButton: {
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.warmBrown,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: BrandColors.white,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing["2xl"],
    paddingVertical: Spacing.sm,
  },
  helpLinkText: {
    color: BrandColors.white,
    opacity: 0.9,
  },
});
