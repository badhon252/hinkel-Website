import { renderHook, act } from "@testing-library/react";
import { useLogin } from "../uselogin";
import { signIn } from "next-auth/react";
import { markEmailAsRecentlyVerified } from "../../lib/recent-email-verification";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("useLogin Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle successful login", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: null, ok: true });

    const { result } = renderHook(() => useLogin());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.handleLogin(
        "test@example.com",
        "password",
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(loginResult).toEqual({ success: true });
    expect(signIn).toHaveBeenCalledWith("credentials", {
      redirect: false,
      email: "test@example.com",
      password: "password",
    });
  });

  it("should handle login error from signIn result", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleLogin("test@example.com", "wrongpassword");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid credentials");
  });

  it("should handle unexpected errors", async () => {
    (signIn as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleLogin("test@example.com", "password");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Something went wrong");
  });

  it("retries login for a recently verified email before allowing sign-in", async () => {
    jest.useFakeTimers();
    markEmailAsRecentlyVerified("test@example.com");

    (signIn as jest.Mock)
      .mockResolvedValueOnce({
        error: JSON.stringify({
          status: 403,
          message: "Please verify your email",
          data: {
            email: "test@example.com",
            maskedEmail: "te***@example.com",
            expiresInMinutes: 15,
            resendCooldownSeconds: 60,
            verificationRequired: true,
          },
        }),
      })
      .mockResolvedValueOnce({ error: null, ok: true });

    const { result } = renderHook(() => useLogin());

    let loginResult;
    await act(async () => {
      const loginPromise = result.current.handleLogin(
        "test@example.com",
        "password",
      );
      await jest.advanceTimersByTimeAsync(800);
      loginResult = await loginPromise;
    });

    expect(signIn).toHaveBeenCalledTimes(2);
    expect(loginResult).toEqual({ success: true });
    expect(result.current.error).toBeNull();
    jest.useRealTimers();
  });

  it("keeps the user on login instead of sending them back to OTP when verification is still syncing", async () => {
    jest.useFakeTimers();
    markEmailAsRecentlyVerified("test@example.com");

    (signIn as jest.Mock).mockResolvedValue({
      error: JSON.stringify({
        status: 403,
        message: "Please verify your email",
        data: {
          email: "test@example.com",
          maskedEmail: "te***@example.com",
          expiresInMinutes: 15,
          resendCooldownSeconds: 60,
          verificationRequired: true,
        },
      }),
    });

    const { result } = renderHook(() => useLogin());

    let loginResult;
    await act(async () => {
      const loginPromise = result.current.handleLogin(
        "test@example.com",
        "password",
      );
      await jest.advanceTimersByTimeAsync(800 + 1500 + 2500);
      loginResult = await loginPromise;
    });

    expect(signIn).toHaveBeenCalledTimes(4);
    expect(loginResult).toEqual({
      success: false,
      message:
        "Your email was verified successfully. We're syncing your account now, so please try signing in again in a few seconds.",
      verificationPending: true,
    });
    expect(result.current.error).toBe(
      "Your email was verified successfully. We're syncing your account now, so please try signing in again in a few seconds.",
    );
    jest.useRealTimers();
  });

  it("does not retry login for unverified users without a recent verification marker", async () => {
    (signIn as jest.Mock).mockResolvedValue({
      error: JSON.stringify({
        status: 403,
        message: "Please verify your email",
        data: {
          email: "test@example.com",
          maskedEmail: "te***@example.com",
          expiresInMinutes: 15,
          resendCooldownSeconds: 60,
          verificationRequired: true,
        },
      }),
    });

    const { result } = renderHook(() => useLogin());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.handleLogin(
        "test@example.com",
        "password",
      );
    });

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(loginResult).toEqual({
      success: false,
      message: "Please verify your email",
      verification: {
        email: "test@example.com",
        maskedEmail: "te***@example.com",
        expiresInMinutes: 15,
        resendCooldownSeconds: 60,
        verificationRequired: true,
      },
    });
    expect(result.current.error).toBe("Please verify your email");
  });
});
