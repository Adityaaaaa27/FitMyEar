import React, { useState, useRef, useEffect } from "react";
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

export default function CameraCaptureScreen({
  navigation,
}: CameraCaptureScreenProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const stored = await PhotoStorage.getPhotos();
    setPhotos(stored);
  };

  const triggerVibration = async () => {
    try {
      if (Platform.OS === "web") {
        if ("vibrate" in navigator) {
          navigator.vibrate(100);
        }
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      Vibration.vibrate(100);
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    
    await triggerVibration();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo) {
        const saved = await PhotoStorage.savePhoto(photo.uri);
        setPhotos((prev) => [...prev, saved]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo");
    } finally {
      setIsCapturing(false);
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
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const deletePhoto = async (id: string) => {
    await PhotoStorage.deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
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
    if (photos.length === 0) {
      Alert.alert(
        "No Photos",
        "Please capture at least one photo before continuing",
      );
      return;
    }
    navigation.navigate("Upload");
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText type="body">Loading camera...</ThemedText>
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
          <Feather name="camera-off" size={48} color={BrandColors.primaryCoral} />
        </View>
        <ThemedText type="h3" style={styles.permissionTitle}>
          Camera Access Required
        </ThemedText>
        <ThemedText type="body" style={styles.permissionText}>
          FitMyEar needs camera access to capture photos of your ear for
          creating custom-fit ear pieces.
        </ThemedText>

        {canAskAgain ? (
          <Pressable
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={requestPermission}
          >
            <ThemedText
              type="body"
              style={styles.buttonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Enable Camera
            </ThemedText>
          </Pressable>
        ) : Platform.OS !== "web" ? (
          <Pressable
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={async () => {
              try {
                await Linking.openSettings();
              } catch (error) {
                Alert.alert(
                  "Unable to open settings",
                  "Please enable camera access in your device settings.",
                );
              }
            }}
          >
            <ThemedText
              type="body"
              style={styles.buttonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Open Settings
            </ThemedText>
          </Pressable>
        ) : (
          <ThemedText type="small" style={styles.permissionNote}>
            Run in Expo Go to use this feature
          </ThemedText>
        )}

        <Pressable
          style={styles.galleryLink}
          onPress={pickImage}
        >
          <ThemedText
            type="body"
            lightColor={BrandColors.primaryCoral}
            darkColor={BrandColors.primaryCoral}
          >
            Or select from gallery
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.earGuide}>
            <View style={styles.earOutline} />
          </View>
          <View
            style={[styles.instructionContainer, { paddingTop: insets.top + 60 }]}
          >
            <ThemedText
              type="body"
              style={styles.instruction}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Position your ear within the guide
            </ThemedText>
          </View>
        </View>
      </CameraView>

      <View style={[styles.controls, { paddingBottom: insets.bottom + Spacing.lg }]}>
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
            <ThemedText type="small" style={styles.thumbnailPlaceholderText}>
              Captured photos will appear here
            </ThemedText>
          </View>
        )}

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={pickImage}
          >
            <Feather name="image" size={24} color={BrandColors.primaryCoral} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.captureButton,
              pressed && styles.captureButtonPressed,
              isCapturing && styles.captureButtonDisabled,
            ]}
            onPress={capturePhoto}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.buttonPressed,
              photos.length === 0 && styles.doneButtonDisabled,
            ]}
            onPress={handleDone}
          >
            <ThemedText
              type="body"
              style={styles.doneButtonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Done ({photos.length})
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
  captureButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.white,
    borderWidth: 4,
    borderColor: BrandColors.primaryCoral,
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
