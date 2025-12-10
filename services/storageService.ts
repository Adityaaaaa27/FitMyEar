// services/storageService.ts
import { supabase } from "./supabaseClient";

export const uploadImageAsync = async (
  localUri: string,
  userId: string
): Promise<string> => {
  const ext = localUri.split(".").pop() || "jpg";
  const fileName = `${Date.now()}.${ext}`;
  const filePath = `users/${userId}/uploads/${fileName}`;

  console.log("Uploading to Supabase:", filePath);

  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    name: fileName,
    type: "image/jpeg",
  } as any);

  const { data, error } = await supabase.storage
    .from("ear-uploads") // ✅ MAKE SURE THIS IS YOUR EXACT BUCKET NAME
    .upload(filePath, formData, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    console.error("❌ Supabase upload error:", error);
    throw error;
  }

  console.log("✅ Supabase upload success:", data);

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("ear-uploads")
    .getPublicUrl(filePath);

  console.log("✅ Supabase public URL:", publicUrl);

  return publicUrl;
};
