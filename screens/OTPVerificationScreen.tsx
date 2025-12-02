import React, { useState, useRef, useEffect } from "react";
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
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { verifyOTP, sendOTP } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

const { width, height } = Dimensions.get("window");
const OTP_LENGTH = 6;

type OTPVerificationScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "OTPVerification">;
  route: RouteProp<AuthStackParamList, "OTPVerification">;
};

export default function OTPVerificationScreen({ navigation, route }: OTPVerificationScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { phoneNumber, isSignUp } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const digits = value.split("").slice(0, OTP_LENGTH);
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const lastFilledIndex = Math.min(index + digits.length - 1, OTP_LENGTH - 1);
      inputRefs.current[lastFilledIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(phoneNumber, otpCode);
      if (result.success) {
        await signIn(phoneNumber, "phone-auth");
      } else {
        Alert.alert("Error", "Invalid verification code");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(30);
    
    try {
      await sendOTP(phoneNumber);
      Alert.alert("Success", "A new verification code has been sent");
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
      setCanResend(true);
    }
  };

  const maskedPhone = phoneNumber.slice(0, -4).replace(/./g, "*") + phoneNumber.slice(-4);

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
          source={require("../assets/images/ear_anatomy_with_device_illustration.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <ThemedText type="h2" style={styles.title}>
            Verify Your Phone
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            We sent a verification code to{"\n"}
            <ThemedText type="body" style={styles.phoneNumber}>
              {maskedPhone}
            </ThemedText>
          </ThemedText>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.verifyButton,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={BrandColors.white} />
            ) : (
              <ThemedText type="body" style={styles.verifyButtonText}>
                Verify
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            <ThemedText type="body" style={styles.resendText}>
              Didn't receive the code?{" "}
            </ThemedText>
            <Pressable onPress={handleResendOTP} disabled={!canResend}>
              <ThemedText
                type="body"
                style={[
                  styles.resendLink,
                  !canResend && styles.resendLinkDisabled,
                ]}
              >
                {canResend ? "Resend" : `Resend in ${resendTimer}s`}
              </ThemedText>
            </Pressable>
          </View>
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
    height: height * 0.22,
  },
  illustration: {
    width: width * 0.45,
    height: width * 0.45,
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
    alignItems: "center",
  },
  title: {
    color: BrandColors.warmBrown,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    lineHeight: 24,
  },
  phoneNumber: {
    color: BrandColors.warmBrown,
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: BrandColors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "#DDD",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    color: BrandColors.darkText,
  },
  otpInputFilled: {
    borderColor: BrandColors.warmOrange,
  },
  verifyButton: {
    width: "100%",
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
  verifyButtonText: {
    color: BrandColors.white,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing["2xl"],
  },
  resendText: {
    color: "#666",
  },
  resendLink: {
    color: BrandColors.warmOrange,
    fontWeight: "600",
  },
  resendLinkDisabled: {
    color: "#999",
  },
});
