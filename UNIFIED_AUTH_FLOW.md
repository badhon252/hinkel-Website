# Unified Login and Create Account Flow

This document captures the updated frontend-only auth entry experience.

## Goals

- Use one shared entry surface for both login and signup
- Reduce first-time-user friction with a visible mode toggle
- Keep validation feedback inline and immediate
- Preserve existing callback redirects without backend changes

## Entry Points

- Primary route: `/login`
- Signup mode: `/login?mode=signup`
- Compatibility alias: `/register` immediately resolves into signup mode on the unified page

## Flow Diagram

```mermaid
flowchart TD
    A[User opens auth entry] --> B{Selected mode}
    B -->|Login| C[Show login form]
    B -->|Signup| D[Show signup form]

    C --> E[Enter email + password]
    E --> F{Frontend validation}
    F -->|Invalid email or empty password| G[Inline field error]
    G --> E
    F -->|Valid| H[Submit login]
    H --> I{API response}
    I -->|Success| J[Redirect to callback URL]
    I -->|Verification required| K[Route to verify email flow]
    I -->|Other auth error| L[Top-level error banner]
    L --> E

    D --> M[Enter name, email, password, confirm password, accept terms]
    M --> N{Frontend validation}
    N -->|Missing or invalid fields| O[Inline field errors]
    O --> M
    N -->|Passwords do not match| P[Confirm password error]
    P --> M
    N -->|Valid| Q[Submit signup]
    Q --> R{API response}
    R -->|Success| S[Toast + route to verify email]
    R -->|Signup error| T[Top-level error banner]
    T --> M

    C -. toggle .-> D
    D -. toggle .-> C
```

## Interaction Notes

- Users can switch between login and signup without leaving the page.
- Mode changes update the URL so links remain shareable and callback-safe.
- Password inputs support show/hide toggles in both modes.
- Verified-email return flow lands back on the unified page in login mode.

## Error States Covered

- Missing required input
- Invalid email format
- Password too short during signup
- Password and confirm-password mismatch
- Terms not accepted during signup
- API-driven login or signup errors surfaced in a banner
- Verification-required login redirected into email verification
