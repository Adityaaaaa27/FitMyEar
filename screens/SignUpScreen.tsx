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
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { sendOTP } from "@/services/api";

const { width, height } = Dimensions.get("window");

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignUp">;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [usePhone, setUsePhone] = useState(false);

  const handleSignUpWithEmail = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email.trim(), password);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      Alert.alert("Sign Up Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpWithPhone = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const fullNumber = "+1" + cleanPhone;
      await sendOTP(fullNumber);
      navigation.navigate("OTPVerification", { 
        phoneNumber: fullNumber,
        isSignUp: true 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send verification code.";
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
        <ThemedText type="h4" style={styles.brandName}>
          FitMyEar
        </ThemedText>
        <Pressable style={styles.helpButton} hitSlop={10}>
          <Feather name="help-circle" size={24} color={BrandColors.warmBrown} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../assets/images/person_with_custom_ear_device.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          <ThemedText type="h2" style={styles.title}>
            Create Account
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            Join FitMyEar and get your perfect custom-fit ear pieces
          </ThemedText>

          <View style={styles.toggleContainer}>
            <Pressable
              style={[
                styles.toggleButton,
                !usePhone && styles.toggleButtonActive,
              ]}
              onPress={() => setUsePhone(false)}
            >
              <ThemedText
                type="small"
                style={[
                  styles.toggleText,
                  !usePhone && styles.toggleTextActive,
                ]}
              >
                Email
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                usePhone && styles.toggleButtonActive,
              ]}
              onPress={() => setUsePhone(true)}
            >
              <ThemedText
                type="small"
                style={[
                  styles.toggleText,
                  usePhone && styles.toggleTextActive,
                ]}
              >
                Phone
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.form}>
            <View
              style={[
                styles.inputContainer,
                focusedField === "name" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {usePhone ? (
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "phone" && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            ) : (
              <>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "email" && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "password" && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === "confirmPassword" && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={usePhone ? handleSignUpWithPhone : handleSignUpWithEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={BrandColors.white} />
              ) : (
                <ThemedText type="body" style={styles.buttonText}>
                  {usePhone ? "Send Verification Code" : "Create Account"}
                </ThemedText>
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <ThemedText type="body" style={styles.linkText}>
              Already have an account?{" "}
              <ThemedText type="body" style={styles.linkTextAccent}>
                Sign In
              </ThemedText>
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  illustrationContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  illustration: {
    width: width * 0.5,
    height: height * 0.15,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: BrandColors.warmCream,
    borderTopLeftRadius: BorderRadius["3xl"],
    borderTopRightRadius: BorderRadius["3xl"],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
  },
  title: {
    color: BrandColors.warmBrown,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: "#666",
    marginBottom: Spacing["2xl"],
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing["2xl"],
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: BrandColors.warmOrange,
  },
  toggleText: {
    color: "#666",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: BrandColors.white,
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: BrandColors.warmOrange,
  },
  input: {
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
    marginTop: Spacing.sm,
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
