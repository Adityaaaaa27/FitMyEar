import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PhotoLightboxProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export function PhotoLightbox({ visible, imageUri, onClose }: PhotoLightboxProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0.8, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleClose = () => {
    scale.value = withSpring(0.8, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onClose)();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        
        <Pressable
          style={[styles.closeButton, { top: insets.top + Spacing.lg }]}
          onPress={handleClose}
        >
          <Feather name="x" size={28} color={BrandColors.white} />
        </Pressable>

        <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.primaryCoral,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
