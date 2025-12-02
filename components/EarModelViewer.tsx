import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";

interface EarModelViewerProps {
  modelId?: string;
  onOrderPress?: () => void;
  showControls?: boolean;
}

export function EarModelViewer({
  modelId,
  onOrderPress,
  showControls = true,
}: EarModelViewerProps) {
  const rotationY = useSharedValue(0);
  const rotationX = useSharedValue(0);
  const scale = useSharedValue(1);
  const autoRotate = useSharedValue(1);

  useEffect(() => {
    rotationY.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      autoRotate.value = 0;
    })
    .onUpdate((event) => {
      rotationY.value = rotationY.value + event.velocityX * 0.01;
      rotationX.value = Math.max(-30, Math.min(30, rotationX.value + event.velocityY * 0.005));
    })
    .onEnd(() => {
      autoRotate.value = 1;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(2, event.scale));
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const earOuterStyle = useAnimatedStyle(() => {
    const rotY = interpolate(
      rotationY.value % 360,
      [0, 90, 180, 270, 360],
      [0, 0.3, 0, -0.3, 0]
    );
    const rotX = rotationX.value * 0.01;

    return {
      transform: [
        { scale: scale.value },
        { perspective: 1000 },
        { rotateY: `${rotY * 20}deg` },
        { rotateX: `${rotX * 10}deg` },
      ],
    };
  });

  const earInnerStyle = useAnimatedStyle(() => {
    const phase = (rotationY.value % 360) / 360;
    const offsetX = Math.sin(phase * Math.PI * 2) * 5;

    return {
      transform: [{ translateX: offsetX }],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const phase = (rotationY.value % 360) / 360;
    const scaleX = 0.8 + Math.sin(phase * Math.PI * 2) * 0.1;

    return {
      transform: [{ scaleX }],
      opacity: 0.15,
    };
  });

  const resetView = () => {
    rotationY.value = withSpring(0);
    rotationX.value = withSpring(0);
    scale.value = withSpring(1);
    autoRotate.value = 1;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.viewerContainer}>
        <View style={styles.backgroundGradient}>
          <View style={styles.gradientInner} />
        </View>

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.modelContainer, earOuterStyle]}>
            <View style={styles.earBase}>
              <Animated.View style={[styles.earOuter, earInnerStyle]}>
                <View style={styles.earHelix} />
                <View style={styles.earAntihelix} />
                <View style={styles.earConcha}>
                  <View style={styles.earCanal} />
                </View>
                <View style={styles.earTragus} />
                <View style={styles.earLobe} />
              </Animated.View>

              <View style={styles.highlightTop} />
              <View style={styles.highlightSide} />
            </View>
          </Animated.View>
        </GestureDetector>

        <Animated.View style={[styles.shadow, shadowStyle]} />

        {showControls && (
          <View style={styles.controls}>
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                pressed && styles.controlButtonPressed,
              ]}
              onPress={resetView}
            >
              <Feather name="refresh-cw" size={18} color={BrandColors.primaryBlue} />
            </Pressable>

            <View style={styles.modelInfo}>
              <View style={styles.modelInfoDot} />
              <ThemedText type="small" style={styles.modelInfoText}>
                3D Model Ready
              </ThemedText>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                pressed && styles.controlButtonPressed,
              ]}
              onPress={() => {
                scale.value = withSpring(scale.value === 1 ? 1.5 : 1);
              }}
            >
              <Feather name="zoom-in" size={18} color={BrandColors.primaryBlue} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <Feather name="move" size={14} color="#666" />
          <ThemedText type="small" style={styles.instructionText}>
            Drag to rotate
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <Feather name="maximize-2" size={14} color="#666" />
          <ThemedText type="small" style={styles.instructionText}>
            Pinch to zoom
          </ThemedText>
        </View>
      </View>

      {onOrderPress && (
        <Pressable
          style={({ pressed }) => [
            styles.orderButton,
            pressed && styles.orderButtonPressed,
          ]}
          onPress={onOrderPress}
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
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewerContainer: {
    height: 280,
    backgroundColor: BrandColors.lightBackground,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(26, 92, 255, 0.05)",
  },
  modelContainer: {
    width: 180,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  earBase: {
    width: 120,
    height: 180,
    position: "relative",
  },
  earOuter: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFD5C8",
    borderRadius: 60,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 70,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    position: "relative",
  },
  earHelix: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 15,
    height: 120,
    borderWidth: 12,
    borderColor: "#FFBFAE",
    borderRadius: 50,
    borderBottomWidth: 0,
    borderRightWidth: 8,
  },
  earAntihelix: {
    position: "absolute",
    top: 30,
    left: 25,
    width: 50,
    height: 80,
    borderWidth: 6,
    borderColor: "#FFB09A",
    borderRadius: 30,
    borderBottomWidth: 3,
    borderRightWidth: 4,
  },
  earConcha: {
    position: "absolute",
    top: 60,
    left: 35,
    width: 40,
    height: 50,
    backgroundColor: "#FFB8A8",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  earCanal: {
    width: 16,
    height: 20,
    backgroundColor: "#2C1810",
    borderRadius: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 6,
  },
  earTragus: {
    position: "absolute",
    top: 65,
    left: 25,
    width: 20,
    height: 25,
    backgroundColor: "#FFC4B5",
    borderRadius: 10,
    borderTopRightRadius: 15,
  },
  earLobe: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 25,
    height: 45,
    backgroundColor: "#FFD0C2",
    borderRadius: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 30,
  },
  highlightTop: {
    position: "absolute",
    top: 15,
    right: 20,
    width: 30,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 4,
    transform: [{ rotate: "-30deg" }],
  },
  highlightSide: {
    position: "absolute",
    top: 50,
    right: 12,
    width: 6,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 3,
  },
  shadow: {
    position: "absolute",
    bottom: 20,
    width: 100,
    height: 20,
    backgroundColor: "#000",
    borderRadius: 50,
  },
  controls: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  controlButtonPressed: {
    opacity: 0.8,
  },
  modelInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modelInfoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#27AE60",
  },
  modelInfoText: {
    color: "#666",
  },
  instructions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  instructionText: {
    color: "#666",
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
  orderButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  orderButtonText: {
    fontWeight: "600",
  },
});
