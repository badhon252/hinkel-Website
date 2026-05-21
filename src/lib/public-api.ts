import type { PricingResponse } from "@/features/book-creation/types";
import type {
  ContentResponse,
  CategoryHeader,
  CategoryContent,
} from "@/features/category-page/types";
import type { StyleResponse } from "@/features/dashboard/types/style.types";
import type { AboutResponse } from "@/features/dashboard/types/about.types";
import type { PrivacyResponse } from "@/features/dashboard/types/privacy.types";
import type { ReturnPolicyResponse } from "@/features/dashboard/types/return-policy.types";
import type { TermConditionResponse } from "@/features/dashboard/types/terms-conditions.types";
import type { PublicFaqResponse } from "@/features/website-content/api/website-content.api";
import type { CmsContent } from "@/features/dashboard/api/cms.api";
import type { PublicFaqData } from "@/features/website-content/api/website-content.api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REVALIDATE_SECONDS = 300;

function getApiUrl() {
  if (!API_URL) {
    return null;
  }

  return API_URL.replace(/\/$/, "");
}

async function fetchPublicJson<T>(path: string): Promise<T | null> {
  const baseUrl = getApiUrl();

  if (!baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getPublicContent(params: {
  type?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params.type) {
    query.set("type", params.type);
  }

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return (
    (await fetchPublicJson<ContentResponse>(`/content${suffix}`)) ?? {
      success: false,
      data: [],
    }
  );
}

export async function getPublicCategoryHeader() {
  const response = await fetchPublicJson<{ data?: { data?: CategoryHeader } }>(
    "/content/get-header",
  );
  return response?.data?.data;
}

export async function getPublicCmsByType(type: string) {
  return (
    (await fetchPublicJson<{
      data?: { data?: { contents?: CmsContent[] } };
    }>(`/content/cms/type/${encodeURIComponent(type)}?page=1&limit=10`)) ?? {
      data: { data: { contents: [] } },
    }
  );
}

export async function getPublicFaq() {
  return (
    (await fetchPublicJson<PublicFaqResponse>("/faqs/pricing")) ?? {
      success: false,
      statusCode: 500,
      message: "Unavailable",
      data: {
        _id: "",
        key: "",
        title: "",
        subtitle: "",
        status: "",
        cta: {
          enabled: false,
          heading: "",
          text: "",
          button: {
            label: "",
            href: "",
            target: "_self",
          },
          avatars: [],
        },
        items: [],
        createdAt: "",
        updatedAt: "",
        publishedAt: "",
      },
    }
  );
}

export function getActiveFaqItems(faqData?: PublicFaqData | null) {
  return (
    faqData?.items
      .filter((item) => item.isActive)
      .sort((a, b) => a.order - b.order) ?? []
  );
}

export function getCategoryLinks(contents: CategoryContent[] | undefined) {
  return (
    contents
      ?.filter((item) => item.type?.toLowerCase() !== "home")
      .sort((a, b) => (a.type || "").localeCompare(b.type || "")) ?? []
  );
}

export async function getPublicAbout() {
  return (
    (await fetchPublicJson<AboutResponse>("/admin/pages/")) ?? {
      success: false,
      statusCode: 500,
      message: "Unavailable",
      data: {
        title: "",
        content: "",
      },
    }
  );
}

export async function getPublicPrivacy() {
  return (
    (await fetchPublicJson<PrivacyResponse>("/admin/privacy")) ?? {
      success: false,
      statusCode: 500,
      message: "Unavailable",
      data: {
        title: "",
        content: "",
        status: "draft",
      },
    }
  );
}

export async function getPublicReturnPolicy() {
  return (
    (await fetchPublicJson<ReturnPolicyResponse>(
      "/policy/get-return-policy",
    )) ?? {
      success: false,
      statusCode: 500,
      message: "Unavailable",
      data: [],
    }
  );
}

export async function getPublicTerms() {
  return (
    (await fetchPublicJson<TermConditionResponse>(
      "/terms/get-term-condition",
    )) ?? {
      success: false,
      statusCode: 500,
      message: "Unavailable",
      data: [],
    }
  );
}

export async function getPublicStyles() {
  return (
    (await fetchPublicJson<StyleResponse>("/style/")) ?? {
      success: false,
      statusCode: 500,
      message: "Unavailable",
      data: [],
    }
  );
}

export async function getPublicPricing() {
  return (
    (await fetchPublicJson<PricingResponse>("/pricing/admin/get-prices")) ?? {
      success: false,
      data: [],
    }
  );
}

export function getHeroContentByType(
  contents: CategoryContent[] | undefined,
  type?: string,
) {
  return contents?.find((item) => item.type === type) ?? contents?.[0];
}
