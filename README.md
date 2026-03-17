# Playwright Test Pyramid Framework

This project demonstrates a scalable Playwright automation framework implementing:

- Test Pyramid Strategy (API > Hybrid > UI)
- Page Object Model (POM)
- API Contract Testing
- State Transition Testing (Cart flow)
- UI + API Integration validation
- Robust network-based stabilization
- Environment configuration support

  ## Design Decisions

- Used API tests as a foundation (Pyramid base) for cart state validation
- Used Hybrid tests to validate UI-triggered backend behavior
- Used UI tests only for visual and interaction validation
- Stabilized registration using network response rather than redirect assumptions
- Implemented safe pagination to avoid flaky UI transitions
Where possible, validations are done at the API level to avoid relying solely on UI assertions.

## Example Hybrid Flow

A typical hybrid test follows this pattern:

1. Perform an action in the UI (e.g., update profile or add to cart)
2. Verify the UI reflects the change
3. Call the corresponding API (e.g., `/users/me`, `/cart`)
4. Validate that the backend data matches the UI

This approach helps catch issues that are not visible through UI validation alone.

AI-assisted tools such as GitHub Copilot were used… but all design decisions… were reviewed deliberately.

## Tech Stack

- Playwright (TypeScript)
- Node.js
- APIRequestContext
- Hybrid UI + API validation
- State transition testing

## Test Structure

tests/
  api/
  hybrid/
  ui/

src/
  pages/
  api/_helpers/
This framework demonstrates enterprise-level automation architecture.
