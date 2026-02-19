import { api } from "@/lib/api";

export interface CategoryContent {
  _id?: string;
  id?: string;
  title: string;
  subtitle: string;
  type: string;
  image: string | File;
  gallery?: (string | File)[];
  [key: string]: unknown;
}

// Get content with dynamic params
export async function getContent(params: Record<string, unknown>) {
  try {
    const res = await api.get("/content", { params });
    return res.data;
  } catch (err) {
    console.error("Error fetching content:", err);
    throw new Error("Failed to fetch content");
  }
}

// Create new content
export async function createContent(data: FormData) {
  try {
    const res = await api.post("/content/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Error creating content:", err);
    throw new Error("Failed to create content");
  }
}

// Update existing content
export async function updateContent(id: string, data: FormData) {
  try {
    const res = await api.patch(`/content/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("Error updating content:", err);
    throw new Error("Failed to update content");
  }
}

// Delete content
export async function deleteContent(id: string) {
  try {
    const res = await api.delete(`/content/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting content:", err);
    throw new Error("Failed to delete content");
  }
}
