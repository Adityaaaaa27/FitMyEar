import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { AuthStackParamList } from "@/navigation/AuthNavigator";

import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

type SignInScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignIn">;
};

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // image loading state for placeholder
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign in. Please try again.";
      Alert.alert("Sign In Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const keyboardVerticalOffset = insets.top + 10;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {navigation.canGoBack() ? (
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                hitSlop={10}
              >
                <Feather name="arrow-left" size={24} color={BrandColors.warmBrown} />
              </Pressable>
            ) : (
              <View style={styles.backButton} />
            )}
            <ThemedText type="h4" style={styles.brandName}>
              FitMyEar
            </ThemedText>
            <Pressable style={styles.helpButton} hitSlop={10}>
              <Feather name="help-circle" size={24} color={BrandColors.warmBrown} />
            </Pressable>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.content}>
              {/* ===== LOGIN PAGE IMAGE: optimized ===== */}
              <View style={styles.imageWrapper}>
                {!imgLoaded && (
                  <View style={styles.imagePlaceholder}>
                    <ActivityIndicator color={BrandColors.warmOrange} />
                  </View>
                )}

                <Image
                  source={require("../assets/images/welcome.png")}
                  style={styles.illustration}
                  contentFit="contain"
                  transition={250}
                  cachePolicy="memory-disk"
                  onLoad={() => setImgLoaded(true)}
                />
              </View>

              <ThemedText type="h2" style={styles.title}>
                Welcome Back!
              </ThemedText>

              <View style={styles.form}>
                <View style={[styles.inputContainer, focusedField === "email" && styles.inputFocused]}>
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
                    returnKeyType="next"
                  />
                </View>

                <View style={[styles.inputContainer, focusedField === "password" && styles.inputFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="done"
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={BrandColors.white} />
                  ) : (
                    <ThemedText type="body" style={styles.buttonText}>
                      Login
                    </ThemedText>
                  )}
                </Pressable>
              </View>

              <Pressable style={styles.linkButton} onPress={() => navigation.navigate("SignUp")}>
                <ThemedText type="body" style={styles.linkText}>
                  Not member?{" "}
                  <ThemedText type="body" style={styles.linkTextAccent}>
                    Register Now!
                  </ThemedText>
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.bottomIllustration} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    width: Math.min(width * 0.9, 760),
    height: Math.min(height * 0.28, 360),
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: BrandColors.lightBackground,
  },

  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.lightBackground,
  },

  illustration: {
    width: "100%",
    height: "100%",
  },

  container: {
    flexGrow: 1,
    backgroundColor: BrandColors.warmCream,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    paddingTop: Spacing.lg,
  },
  title: {
    color: BrandColors.warmBrown,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: "#666",
    lineHeight: 22,
    marginBottom: Spacing["2xl"],
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
  bottomIllustration: {
    alignItems: "center",
    paddingBottom: Spacing.lg,
  },
});
