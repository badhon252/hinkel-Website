// src/features/dashboard/api/terms-conditions.api.ts
import { api } from "@/lib/api";
import {
  TermConditionResponse,
  TermConditionSingleResponse,
  TermConditionPayload,
} from "../types/terms-conditions.types";

export const getTermConditionApi = async (): Promise<TermConditionResponse> => {
  try {
    const res = await api.get<TermConditionResponse>(
      "/terms/get-term-condition",
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching Terms of Service:", error);
    throw error;
  }
};

export const createTermConditionApi = async (
  data: TermConditionPayload,
  token?: string,
): Promise<TermConditionSingleResponse> => {
  try {
    const res = await api.post<TermConditionSingleResponse>(
      "/terms/create-term-condition",
      data,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error creating Terms of Service:", error);
    throw error;
  }
};

export const updateTermConditionApi = async (
  id: string,
  data: Partial<TermConditionPayload>,
  token?: string,
): Promise<TermConditionSingleResponse> => {
  try {
    const res = await api.patch<TermConditionSingleResponse>(
      `/terms/update-term-condition/${id}`,
      data,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error updating Terms of Service:", error);
    throw error;
  }
};

export const deleteTermConditionApi = async (
  id: string,
  token?: string,
): Promise<TermConditionSingleResponse> => {
  try {
    const res = await api.delete<TermConditionSingleResponse>(
      `/terms/delete-term-condition/${id}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return res.data;
  } catch (error) {
    console.error("Error deleting Terms of Service:", error);
    throw error;
  }
};
