import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPublicAboutApi } from "../api/website-content.api";
import { updateAboutApi } from "@/features/dashboard/api/about.api";
import { AboutConfig } from "@/features/dashboard/types/about.types";

export const useAbout = () => {
  return useQuery({
    queryKey: ["about"],
    queryFn: () => getPublicAboutApi(),
  });
};

// Kept for backward compatibility if needed, but renamed to share same cache
export const usePublicAbout = useAbout;

export const useUpdateAbout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AboutConfig>) => updateAboutApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
    },
  });
};
