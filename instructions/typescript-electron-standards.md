# TypeScript + Electron Development Standards

## Project Structure

- Separate `main` (Electron process) and `renderer` (UI) code in `src/main/` and `src/renderer/`.
- Use a `preload.ts` script to safely expose APIs from main to renderer via Electron’s `contextBridge`.

## TypeScript Configuration

- Use `tsconfig.json` with `strict: true` for type safety.
- Target ES2020 or later for modern JS features.
- Use `module: "commonjs"` for main, `"esnext"` for renderer.

## Authentication

- Use the official Bluesky TypeScript SDK for authentication and API calls.
- Implement login via Bluesky’s session API (`com.atproto.server.createSession`).
- Store tokens securely (never in plain text, never in renderer process).
- Use IPC and preload scripts to handle sensitive operations.

## Security

- Always use the latest Electron version.
- Disable `nodeIntegration` and enable `contextIsolation` for all renderer windows.
- Enable process sandboxing.
- Define a strict Content Security Policy (CSP).
- Only load resources over HTTPS.
- Validate all IPC message senders.
- Never expose raw Electron APIs to untrusted content.
- Avoid using the `file://` protocol; prefer custom protocols for local files.

## Coding Standards

- Use TypeScript interfaces and types for all data structures.
- Prefer async/await for asynchronous code.
- Use dependency injection for testability.
- Document all public functions and classes with JSDoc comments.

## Dependency Management

- Use `npm` or `yarn` for package management.
- Audit dependencies regularly (`npm audit`).
- Only use well-maintained, reputable packages.

## Transparency & Trust

- Make authentication flows clear to users.
- Open source your code or provide auditability.
- Publish a privacy policy and document data handling.

---

_Last updated: July 26, 2025_
