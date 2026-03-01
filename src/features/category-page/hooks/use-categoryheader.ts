// features/category-page/hooks/use-categoryheader.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCategoryHeader,
  postCategoryHeader,
} from "../api/categoryheader.api";
import { CategoryHeader } from "../types";

// GET
export const useCategoryHeader = () => {
  return useQuery({
    queryKey: ["/content/get-header"],
    queryFn: () => getCategoryHeader(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// POST
export const usePostCategoryHeader = () => {
  return useMutation({
    mutationFn: (data: CategoryHeader) => postCategoryHeader(data),
  });
};
