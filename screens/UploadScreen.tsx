import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { PhotoStorage, CapturedPhoto } from "@/utils/storage";
import { PhotoAPI, ReconstructionAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { MainStackParamList } from "@/navigation/MainNavigator";

type UploadScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, "Upload">;
};

export default function UploadScreen({ navigation }: UploadScreenProps) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");

  const progressWidth = useSharedValue(0);

  const loadPhotos = useCallback(async () => {
    const stored = await PhotoStorage.getPhotos();
    setPhotos(stored);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos])
  );

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          const saved = await PhotoStorage.savePhoto(asset.uri);
          setPhotos((prev) => [...prev, saved]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image from gallery");
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

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleUpload = async () => {
    if (!user) {
      Alert.alert("Error", "Please sign in to upload photos");
      return;
    }

    if (photos.length === 0) {
      Alert.alert("No Photos", "Please add photos first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const photoData = photos.map((photo, index) => ({
        uri: photo.uri,
        side: (index % 2 === 0 ? "left" : "right") as "left" | "right",
      }));

      for (let i = 0; i < photos.length; i++) {
        const progress = ((i + 1) / photos.length) * 80;
        progressWidth.value = withTiming(progress, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        setUploadProgress(Math.round(progress));
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      const uploadedPhotos = await PhotoAPI.uploadPhotos(user.id, photoData);
      
      progressWidth.value = withTiming(90, { duration: 300 });
      setUploadProgress(90);

      await ReconstructionAPI.createJob(
        user.id,
        uploadedPhotos.map((p) => p.id)
      );

      progressWidth.value = withTiming(100, { duration: 300 });
      setUploadProgress(100);

      await PhotoStorage.clearPhotos();

      setIsUploading(false);

      Alert.alert(
        "Upload Complete",
        "Your ear photos have been uploaded successfully. 3D reconstruction has started.",
        [
          {
            text: "View Status",
            onPress: () => navigation.navigate("ReconstructionStatus"),
          },
          {
            text: "Go Home",
            onPress: () => navigation.navigate("Dashboard"),
          },
        ]
      );
    } catch (error) {
      setIsUploading(false);
      const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
      Alert.alert("Upload Failed", message);
    }
  };

  return (
    <ScreenScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="h3" style={styles.title}>
          Upload Your Photos
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          {photos.length > 0
            ? `${photos.length} photo${photos.length > 1 ? "s" : ""} ready to upload`
            : "Select photos from your gallery"}
        </ThemedText>
      </View>

      {photos.length > 0 ? (
        <View style={styles.photosGrid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoCard}>
              <Pressable onPress={() => openLightbox(photo.uri)} style={styles.photoTouchable}>
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed,
                ]}
                onPress={() => deletePhoto(photo.id)}
              >
                <Feather name="trash-2" size={18} color={BrandColors.white} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="image" size={48} color={BrandColors.primaryCoral} />
          </View>
          <ThemedText type="body" style={styles.emptyText}>
            No photos yet
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.galleryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={pickImage}
          >
            <Feather name="image" size={20} color={BrandColors.white} />
            <ThemedText
              type="body"
              style={styles.galleryButtonText}
              lightColor={BrandColors.white}
              darkColor={BrandColors.white}
            >
              Select from Gallery
            </ThemedText>
          </Pressable>
        </View>
      )}

      {photos.length > 0 && (
        <View style={styles.actions}>
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[styles.progressFill, animatedProgressStyle]}
                />
              </View>
              <View style={styles.uploadingInfo}>
                <ActivityIndicator
                  size="small"
                  color={BrandColors.primaryCoral}
                />
                <ThemedText type="body" style={styles.uploadingText}>
                  {uploadProgress < 80
                    ? `Uploading photos... ${uploadProgress}%`
                    : uploadProgress < 100
                    ? "Starting reconstruction..."
                    : "Complete!"}
                </ThemedText>
              </View>
            </View>
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.addMoreButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={pickImage}
              >
                <Feather
                  name="plus"
                  size={20}
                  color={BrandColors.primaryCoral}
                />
                <ThemedText
                  type="body"
                  style={styles.addMoreText}
                  lightColor={BrandColors.primaryCoral}
                  darkColor={BrandColors.primaryCoral}
                >
                  Add More from Gallery
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.uploadButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleUpload}
              >
                <Feather name="upload-cloud" size={20} color={BrandColors.white} />
                <ThemedText
                  type="body"
                  style={styles.uploadButtonText}
                  lightColor={BrandColors.white}
                  darkColor={BrandColors.white}
                >
                  Upload to FitMyEar Cloud
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      )}

      <PhotoLightbox
        visible={lightboxVisible}
        imageUri={selectedPhoto}
        onClose={closeLightbox}
      />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    color: BrandColors.darkText,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: "#8B7B6B",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  photoCard: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: BrandColors.lightBackground,
  },
  photoTouchable: {
    flex: 1,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    backgroundColor: BrandColors.primaryCoral,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BrandColors.lightBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyText: {
    color: "#8B7B6B",
    marginBottom: Spacing["2xl"],
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    paddingHorizontal: Spacing["2xl"],
    backgroundColor: BrandColors.primaryCoral,
    borderRadius: BorderRadius.md,
  },
  galleryButtonText: {
    fontWeight: "600",
  },
  actions: {
    marginTop: Spacing["3xl"],
    gap: Spacing.lg,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: BrandColors.primaryCoral,
    backgroundColor: BrandColors.white,
  },
  addMoreText: {
    fontWeight: "600",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.primaryCoral,
  },
  uploadButtonText: {
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  uploadingContainer: {
    gap: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: BrandColors.lightBackground,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.primaryCoral,
    borderRadius: 4,
  },
  uploadingInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  uploadingText: {
    color: BrandColors.primaryCoral,
    fontWeight: "500",
  },
});
