import AsyncStorage from "@react-native-async-storage/async-storage";

const PHOTOS_KEY = "@fitmyear_captured_photos";
const STATUS_KEY = "@fitmyear_reconstruction_status";

export interface CapturedPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

export type ReconstructionStep = "queued" | "processing" | "completed";

export interface ReconstructionStatus {
  step: ReconstructionStep;
  uploadedAt: number | null;
  completedAt: number | null;
}

export const PhotoStorage = {
  async getPhotos(): Promise<CapturedPhoto[]> {
    try {
      const stored = await AsyncStorage.getItem(PHOTOS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to get photos:", error);
      return [];
    }
  },

  async savePhoto(uri: string): Promise<CapturedPhoto> {
    const photos = await this.getPhotos();
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      uri,
      timestamp: Date.now(),
    };
    photos.push(newPhoto);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    return newPhoto;
  },

  async deletePhoto(id: string): Promise<void> {
    const photos = await this.getPhotos();
    const filtered = photos.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(filtered));
  },

  async clearPhotos(): Promise<void> {
    await AsyncStorage.removeItem(PHOTOS_KEY);
  },
};

export const ReconstructionStorage = {
  async getStatus(): Promise<ReconstructionStatus | null> {
    try {
      const stored = await AsyncStorage.getItem(STATUS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to get status:", error);
      return null;
    }
  },

  async setStatus(status: ReconstructionStatus): Promise<void> {
    await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(status));
  },

  async startReconstruction(): Promise<void> {
    const status: ReconstructionStatus = {
      step: "queued",
      uploadedAt: Date.now(),
      completedAt: null,
    };
    await this.setStatus(status);
  },

  async updateStep(step: ReconstructionStep): Promise<void> {
    const current = await this.getStatus();
    if (current) {
      current.step = step;
      if (step === "completed") {
        current.completedAt = Date.now();
      }
      await this.setStatus(current);
    }
  },

  async clearStatus(): Promise<void> {
    await AsyncStorage.removeItem(STATUS_KEY);
  },
};
