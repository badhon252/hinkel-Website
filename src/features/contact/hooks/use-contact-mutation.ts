import { useMutation } from "@tanstack/react-query";
import { submitContactForm, ContactFormData } from "../api/contact.api";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useContactMutation = () => {
  return useMutation({
    mutationFn: (data: ContactFormData) => submitContactForm(data),
    onSuccess: () => {
      toast.success("Your message has been sent successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to send message");
    },
  });
};
