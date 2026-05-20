export type AuthMode = "login" | "signup";

type BuildAuthPathOptions = {
  mode?: AuthMode;
  callbackUrl?: string | null;
  email?: string | null;
  verified?: boolean;
};

export const buildAuthPath = ({
  mode = "login",
  callbackUrl,
  email,
  verified = false,
}: BuildAuthPathOptions = {}) => {
  const params = new URLSearchParams();

  if (mode === "signup") {
    params.set("mode", "signup");
  }

  if (callbackUrl) {
    params.set("callbackUrl", callbackUrl);
  }

  if (email) {
    params.set("email", email);
  }

  if (verified) {
    params.set("verified", "1");
  }

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
};
