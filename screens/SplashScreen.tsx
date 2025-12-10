import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
  SafeAreaView,
  AccessibilityProps,
} from "react-native";
import { BrandColors } from "@/constants/theme";

interface SplashScreenProps extends AccessibilityProps {
  onComplete: () => void;
  duration?: number; // optional override for timeout (ms)
}

export default function SplashScreen({
  onComplete,
  duration = 2000,
  ...accessibilityProps
}: SplashScreenProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Animated value for fade in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      onCompleteRef.current();
    }, duration);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BrandColors.white}
        translucent={false}
      />
      <View style={styles.container} accessible accessibilityLabel="Splash screen" {...accessibilityProps}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            accessible
            accessibilityLabel="FitMyEar logo"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ec8c72",
  },
  container: {
    flex: 1,
    backgroundColor: "#ec8c72",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 280,
    height: 280,
  },
});
