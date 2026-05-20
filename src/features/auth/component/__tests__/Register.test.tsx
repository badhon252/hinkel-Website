import { fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import Register from "../Register";
import { useRegister } from "../../hooks/useregister";
import { useLogin } from "../../hooks/uselogin";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Mock the hooks
jest.mock("../../hooks/useregister");
jest.mock("../../hooks/uselogin");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => (
    <span data-testid="mock-next-image">{alt || ""}</span>
  ),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe("Register Component", () => {
  const mockHandleRegister = jest.fn();
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRegister as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      handleRegister: mockHandleRegister,
    });

    (useLogin as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      handleLogin: jest.fn(),
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    (usePathname as jest.Mock).mockReturnValue("/register");
  });

  it("renders the register form correctly", () => {
    render(<Register />);
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /create account/i })[1],
    ).toBeInTheDocument();
  });

  it("displays error message when registration fails", () => {
    (useRegister as jest.Mock).mockReturnValue({
      loading: false,
      error: "Registration failed",
      handleRegister: mockHandleRegister,
    });

    render(<Register />);
    expect(screen.getByText("Registration failed")).toBeInTheDocument();
  });

  it("prevents submission when passwords do not match", () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByLabelText(/privacy policy/i));
    fireEvent.click(
      screen.getAllByRole("button", { name: /create account/i })[1],
    );

    expect(
      screen.getByText("Passwords do not match. Please re-enter them."),
    ).toBeInTheDocument();
    expect(mockHandleRegister).not.toHaveBeenCalled();
  });

  it("submits first name, last name, email, and password separately", () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByLabelText(/privacy policy/i));
    fireEvent.click(
      screen.getAllByRole("button", { name: /create account/i })[1],
    );

    expect(mockHandleRegister).toHaveBeenCalledWith(
      "Jane",
      "Doe",
      "jane@example.com",
      "secret123",
    );
  });
});
