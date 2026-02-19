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

This framework demonstrates enterprise-level automation architecture.
