## TypeScript & Electron Coding Standards

### Code Style

- Use strict TypeScript (`strict: true` in tsconfig)
- Prefer ES2020+ syntax
- Use clear, descriptive variable and function names
- Organize code into modules by responsibility
- Use async/await for asynchronous operations

### UI Standards

- Use modern, responsive CSS (flexbox, grid, media queries)
- All UI elements should be accessible (labels, aria attributes)
- Use card-based layouts for results and profiles
- Show only relevant UI based on app state (e.g., login, search)

### Security Best Practices

- Use Electron contextIsolation and disable nodeIntegration in renderer
- Validate and sanitize all user input
- Never store plaintext passwords; use secure credential storage
- Follow Bluesky API security recommendations

### Build & Onboarding

- Use cross-platform build scripts (npm, copyfiles)
- Include a `.gitignore` for Node/Electron/TypeScript
- Document setup and onboarding steps in README
