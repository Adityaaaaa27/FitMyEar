import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { sendOTP } from "@/services/api";

const { width, height } = Dimensions.get("window");

type PhoneSignInScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "PhoneSignIn">;
};

export default function PhoneSignInScreen({ navigation }: PhoneSignInScreenProps) {
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSendOTP = async () => {
    const fullNumber = countryCode + phoneNumber.replace(/\D/g, "");
    
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      await sendOTP(fullNumber);
      navigation.navigate("OTPVerification", { 
        phoneNumber: fullNumber,
        isSignUp: false 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={24} color={BrandColors.warmBrown} />
        </Pressable>
        <Pressable style={styles.helpButton} hitSlop={10}>
          <Feather name="help-circle" size={24} color={BrandColors.warmBrown} />
        </Pressable>
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require("../assets/images/person_with_custom_ear_device.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <ThemedText type="h2" style={styles.title}>
            Login with Phone
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            Enter your phone number to receive a verification code
          </ThemedText>

          <View style={styles.form}>
            <View style={styles.phoneInputRow}>
              <View
                style={[
                  styles.countryCodeContainer,
                  focusedField === "countryCode" && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.countryCodeInput}
                  value={countryCode}
                  onChangeText={setCountryCode}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField("countryCode")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              <View
                style={[
                  styles.phoneInputContainer,
                  focusedField === "phone" && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoFocus
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={BrandColors.white} />
              ) : (
                <ThemedText type="body" style={styles.buttonText}>
                  Send Code
                </ThemedText>
              )}
            </Pressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText type="small" style={styles.dividerText}>or</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.emailButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Feather name="mail" size={20} color={BrandColors.warmBrown} />
            <ThemedText type="body" style={styles.emailButtonText}>
              Continue with Email
            </ThemedText>
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <ThemedText type="body" style={styles.linkText}>
              Not a member?{" "}
              <ThemedText type="body" style={styles.linkTextAccent}>
                Register Now!
              </ThemedText>
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  helpButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    height: height * 0.25,
  },
  illustration: {
    width: width * 0.7,
    height: height * 0.22,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: BrandColors.warmCream,
    borderTopLeftRadius: BorderRadius["3xl"],
    borderTopRightRadius: BorderRadius["3xl"],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  title: {
    color: BrandColors.warmBrown,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: "#666",
    marginBottom: Spacing["2xl"],
  },
  form: {
    gap: Spacing.lg,
  },
  phoneInputRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  countryCodeContainer: {
    width: 70,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  countryCodeInput: {
    height: Spacing.inputHeight,
    textAlign: "center",
    fontSize: 16,
    color: BrandColors.darkText,
  },
  phoneInputContainer: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: BrandColors.warmOrange,
  },
  phoneInput: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: BrandColors.darkText,
  },
  button: {
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.warmOrange,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: BrandColors.white,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing["2xl"],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: Spacing.md,
  },
  emailButton: {
    height: Spacing.buttonHeight,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  emailButtonText: {
    color: BrandColors.warmBrown,
    fontWeight: "500",
  },
  linkButton: {
    marginTop: Spacing["2xl"],
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  linkText: {
    color: "#666",
  },
  linkTextAccent: {
    color: BrandColors.warmOrange,
    fontWeight: "600",
  },
});
