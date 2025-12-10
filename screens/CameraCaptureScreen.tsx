import React, { useState, useRef, useEffect } from "react";
import * as ImageManipulator from "expo-image-manipulator";

import { validateEar } from "../services/earValidation";

import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  Image,
  ScrollView,
  Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { PhotoStorage, CapturedPhoto } from "@/utils/storage";
import { MainStackParamList } from "@/navigation/MainNavigator";

type CameraCaptureScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "CameraCapture">;
};

const SCAN_TARGET_COUNT = 20; // how many photos we want for COLMAP
const SCAN_DELAY_MS = 500; // delay between photos

export default function CameraCaptureScreen({
  navigation,
}: CameraCaptureScreenProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const stored = await PhotoStorage.getPhotos();
    setPhotos(stored);
    setScanProgress(stored.length);
  };

  const triggerVibration = async () => {
    try {
      if (Platform.OS === "web") {
        // @ts-ignore - web vibration
        if ("vibrate" in navigator) {
          // @ts-ignore
          navigator.vibrate(100);
        }
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      Vibration.vibrate(100);
    }
  };

  // OLD
// const captureSinglePhoto = async (): Promise<void> => {

// Crop a rectangle around the ear region before sending to the model
const cropEarRegion = async (photo: {
  uri: string;
  width: number;
  height: number;
}) => {
  const { width, height } = photo;

  // tweak these numbers after testing:
  // - we take a vertical rectangle in the center
  // - 60% of width, 70% of height
  const cropWidth = width * 0.6;
  const cropHeight = height * 0.7;

  const originX = (width - cropWidth) / 2;  // center horizontally
  const originY = (height - cropHeight) / 2; // center vertically

  const result = await ImageManipulator.manipulateAsync(
    photo.uri,
    [
      {
        crop: {
          originX,
          originY,
          width: cropWidth,
          height: cropHeight,
        },
      },
    ],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  // result.uri is a new image that is just the cropped region
  return result.uri;
};

// NEW
const captureSinglePhoto = async (): Promise<boolean> => {
  if (!cameraRef.current) return false;

  await triggerVibration();

  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      skipProcessing: true,
    });

    if (!photo || !photo.uri) return false;

    // 🔴 NEW: crop to ear region
    const croppedUri = await cropEarRegion(photo);

    // 🔍 validate on backend using CROPPED image
    let result;
    try {
      result = await validateEar(croppedUri);
    } catch (err) {
      console.error("Ear validation error:", err);
      if (!isScanning) {
        Alert.alert(
          "Validation error",
          "Could not verify the photo. Check your internet connection and try again."
        );
      }
      return false;
    }

    if (!result?.isEar) {
      console.log(
        "Photo rejected by ear classifier:",
        result?.predictedClass,
        "conf:",
        result?.earConfidence
      );

      Alert.alert(
        "Ear not detected",
        "Please align your ear inside the guide, then start scanning again."
      );
      return false;
    }

    // ✅ Save CROPPED image, not the huge original
    const saved = await PhotoStorage.savePhoto(croppedUri);
    setPhotos((prev) => [...prev, saved]);
    setScanProgress((prev) => prev + 1);

    return true;
  } catch (error) {
    console.error("Failed to capture photo:", error);
    if (!isScanning) {
      Alert.alert("Error", "Failed to capture photo");
    }
    return false;
  }
};




  const delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const startAutoScan = async () => {
    if (isScanning) return;
    if (!cameraRef.current) {
      Alert.alert(
        "Camera not ready",
        "Please wait a moment and try again.",
      );
      return;
    }

    // If there are already photos, we can either continue to 20
    // or clear and start fresh. Here we CONTINUE to 20.
    if (photos.length >= SCAN_TARGET_COUNT) {
      Alert.alert(
        "Photos already captured",
        `You already have ${photos.length} photos. You can delete some if you want to rescan.`,
      );
      return;
    }

    setIsScanning(true);

    try {
      for (let i = photos.length; i < SCAN_TARGET_COUNT; i++) {
  const ok = await captureSinglePhoto();

  if (!ok) {
    // ❌ stop auto-scan immediately on first bad frame
    break;
  }

  await delay(SCAN_DELAY_MS);
}

    } catch (error) {
      console.error("Auto scan error:", error);
      Alert.alert(
        "Scan interrupted",
        "Something went wrong while capturing photos.",
      );
    } finally {
      setIsScanning(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const saved = await PhotoStorage.savePhoto(result.assets[0].uri);
        setPhotos((prev) => [...prev, saved]);
        setScanProgress((prev) => prev + 1);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const deletePhoto = async (id: string) => {
    await PhotoStorage.deletePhoto(id);
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      setScanProgress(updated.length);
      return updated;
    });
  };

  const openLightbox = (uri: string) => {
    setSelectedPhoto(uri);
    setLightboxVisible(true);
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    setSelectedPhoto("");
  };

  const handleDone = () => {
    if (photos.length < SCAN_TARGET_COUNT) {
      Alert.alert(
        "More photos needed",
        `For accurate 3D reconstruction, please capture at least ${SCAN_TARGET_COUNT} photos.\n\nCurrently: ${photos.length}/${SCAN_TARGET_COUNT}`,
      );
      return;
    }

    navigation.navigate("Upload");
  };

  // PERMISSIONS UI
  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText style={styles.permissionTitle}>Loading camera...</ThemedText>
      </View>
    );
  }

  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain;

    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.permissionIcon}>
          <Feather name="camera-off" size={40} color={BrandColors.primaryCoral} />
        </View>
        <ThemedText style={styles.permissionTitle}>
          Camera Access Required
        </ThemedText>
        <ThemedText style={styles.permissionText}>
          FitMyEar needs camera access to capture photos of your ear for creating
          custom-fit ear pieces.
        </ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.permissionButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={
            canAskAgain
              ? requestPermission
              : async () => {
                  try {
                    await Linking.openSettings();
                  } catch (error) {
                    Alert.alert(
                      "Unable to open settings",
                      "Please enable camera access in your device settings.",
                    );
                  }
                }
          }
        >
          <ThemedText style={styles.buttonText}>
            {canAskAgain ? "Enable Camera" : "Open Settings"}
          </ThemedText>
        </Pressable>

        {Platform.OS !== "web" ? null : (
          <ThemedText style={styles.permissionNote}>
            Run this app in Expo Go on your phone to use the camera feature.
          </ThemedText>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.galleryLink,
            pressed && styles.buttonPressed,
          ]}
          onPress={pickImage}
        >
          <ThemedText>Or select from gallery</ThemedText>
        </Pressable>
      </View>
    );
  }

  // MAIN CAMERA UI
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.camera}>
        <CameraView
          ref={(ref) => {
            cameraRef.current = ref;
          }}
          style={StyleSheet.absoluteFill}
        />

        {/* Overlay with ear guide */}
        <View style={styles.overlay}>
          <View style={styles.earGuide}>
            <View style={styles.earOutline} />
          </View>

          <View style={styles.instructionContainer}>
            <View style={styles.instruction}>
              <ThemedText>
                Slowly rotate your head while we capture {SCAN_TARGET_COUNT} photos.
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Controls & Thumbnails */}
      <View style={styles.controls}>
        {photos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailScroll}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {photos.map((photo) => (
              <View key={photo.id} style={styles.thumbnailWrapper}>
                <Pressable onPress={() => openLightbox(photo.uri)}>
                  <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
                </Pressable>
                <Pressable
                  style={styles.deleteThumbnail}
                  onPress={() => deletePhoto(photo.id)}
                >
                  <Feather name="x" size={14} color={BrandColors.white} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <ThemedText style={styles.thumbnailPlaceholderText}>
              Captured photos will appear here
            </ThemedText>
          </View>
        )}

        <View style={styles.buttonRow}>
          {/* Gallery button (optional) */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={pickImage}
            disabled={isScanning}
          >
            <Feather
              name="image"
              size={24}
              color={BrandColors.primaryDark}
            />
          </Pressable>

          {/* Auto-scan capture button */}
          <View>
            <Pressable
              style={({ pressed }) => [
                styles.captureButton,
                pressed && !isScanning && styles.captureButtonPressed,
                isScanning && styles.captureButtonDisabled,
              ]}
              onPress={startAutoScan}
              disabled={isScanning}
            >
              <View style={styles.captureButtonInner} />
            </Pressable>
            <ThemedText style={styles.scanLabel}>
              {isScanning
                ? `Scanning… ${scanProgress}/${SCAN_TARGET_COUNT}`
                : `Tap once to capture ${SCAN_TARGET_COUNT} photos`}
            </ThemedText>
          </View>

          {/* Done button */}
          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.buttonPressed,
              photos.length < SCAN_TARGET_COUNT && styles.doneButtonDisabled,
            ]}
            onPress={handleDone}
          >
            <ThemedText style={[styles.buttonText, styles.doneButtonText]}>
              Done ({photos.length}/{SCAN_TARGET_COUNT})
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <PhotoLightbox
        visible={lightboxVisible}
        imageUri={selectedPhoto}
        onClose={closeLightbox}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.darkText,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
    backgroundColor: BrandColors.cream,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  earGuide: {
    width: 240,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  earOutline: {
    width: 180,
    height: 260,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 90,
    transform: [{ rotate: "15deg" }],
  },
  instructionContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instruction: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  controls: {
    backgroundColor: BrandColors.cream,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  thumbnailScroll: {
    marginBottom: Spacing.lg,
  },
  thumbnailContainer: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  thumbnailWrapper: {
    position: "relative",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  deleteThumbnail: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BrandColors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailPlaceholder: {
    height: 60,
    marginBottom: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailPlaceholderText: {
    color: "#8B7B6B",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BrandColors.primaryCoral,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.white,
    borderWidth: 4,
    borderColor: BrandColors.primaryCoral,
  },
  captureButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  doneButton: {
    height: 56,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.primaryCoral,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonText: {
    fontWeight: "600",
  },
  scanLabel: {
    marginTop: Spacing.xs,
    textAlign: "center",
    fontSize: 12,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  permissionTitle: {
    color: BrandColors.darkText,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  permissionText: {
    color: "#8B7B6B",
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  permissionButton: {
    height: Spacing.buttonHeight,
    paddingHorizontal: Spacing["3xl"],
    backgroundColor: BrandColors.primaryCoral,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionNote: {
    color: "#8B7B6B",
    textAlign: "center",
  },
  galleryLink: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
  },
  buttonText: {
    fontWeight: "600",
  },
});
