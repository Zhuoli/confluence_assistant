# Build and Distribution Guide - macOS Apple Silicon

This guide explains how to build and distribute the Atlassian AI Assistant as a native **macOS application for Apple Silicon (ARM64)** chips.

## Table of Contents

- [Quick Start](#quick-start)
- [Local Building](#local-building)
- [Automated Builds with GitHub Actions](#automated-builds-with-github-actions)
- [Creating Releases](#creating-releases)
- [Distribution](#distribution)
- [Code Signing (macOS)](#code-signing-macos)

---

## Quick Start

### Build Locally (Mac ARM)

```bash
# Install dependencies
make setup

# Build the TypeScript code
make build

# Package as macOS ARM64 .dmg installer
make package-mac
```

The installer will be in `electron-app/dist/Atlassian AI Assistant-3.0.0-arm64.dmg`

### Build via GitHub Actions (Recommended for Releases)

1. Push a version tag to trigger automatic builds:
   ```bash
   git tag v3.0.0
   git push origin v3.0.0
   ```

2. GitHub Actions will automatically:
   - Build for macOS Apple Silicon (ARM64)
   - Create a GitHub Release
   - Upload the DMG and ZIP installers

---

## Local Building

### Prerequisites

- **Node.js 18+** and npm 9+
- **macOS with Apple Silicon** (M1, M2, M3, M4)
- **Xcode Command Line Tools**: `xcode-select --install`

### Build Commands

Using Make (recommended):

```bash
# Build for macOS ARM64
make package-mac
```

Using npm directly:

```bash
# Install dependencies
npm install
cd electron-app && npm install

# Build TypeScript
npm run build

# Package the app for ARM64
cd electron-app
npm run build:mac
```

### Output Location

The installer is created in `electron-app/dist/`:

- **DMG file**: `Atlassian AI Assistant-3.0.0-arm64.dmg` (installer)
- **ZIP file**: `Atlassian AI Assistant-3.0.0-arm64-mac.zip` (portable)

---

## Automated Builds with GitHub Actions

The repository includes two GitHub Actions workflows optimized for Mac ARM builds:

### 1. Build Workflow (`.github/workflows/build.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual trigger via GitHub UI

**What it does:**
- Builds the macOS ARM64 application
- Uploads build artifacts (available for 7 days)
- Runs on macOS ARM64 runners

**Manual Trigger:**
1. Go to **Actions** tab on GitHub
2. Select **Build Mac Application** workflow
3. Click **Run workflow**

### 2. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push a version tag (e.g., `v3.0.0`)
- Manual trigger via GitHub UI

**What it does:**
- Creates a GitHub Release
- Builds macOS ARM64 installer (.dmg and .zip)
- Uploads installers to the release

**How to trigger:**

```bash
# Create and push a version tag
git tag v3.0.0
git push origin v3.0.0
```

GitHub Actions will automatically:
1. Create a release
2. Build the ARM64 installer
3. Upload DMG and ZIP to the release
4. Publish the release

---

## Creating Releases

### Automated Release Process (Recommended)

1. **Update version** in both `package.json` files:
   ```bash
   # Root package.json
   vim package.json  # Update "version": "3.0.0"

   # Electron package.json
   vim electron-app/package.json  # Update "version": "3.0.0"
   ```

2. **Commit the version bump**:
   ```bash
   git add package.json electron-app/package.json
   git commit -m "Bump version to 3.0.0"
   git push
   ```

3. **Create and push a version tag**:
   ```bash
   git tag v3.0.0
   git push origin v3.0.0
   ```

4. **Wait for GitHub Actions** to complete (check the Actions tab)

5. **Check the release** at `https://github.com/zhuoli/confluence_assistant/releases`

### Manual Release Process

If you prefer to create releases manually:

1. Build locally: `make package-mac`
2. Go to GitHub → Releases → Draft a new release
3. Create a new tag (e.g., `v3.0.0`)
4. Upload the DMG and ZIP from `electron-app/dist/`
5. Write release notes
6. Publish

---

## Distribution

### Distribution Methods

#### 1. GitHub Releases (Easiest)

- Users download installers from: `https://github.com/zhuoli/confluence_assistant/releases`
- GitHub automatically hosts files
- No additional infrastructure needed

#### 2. Direct Download Links

Share direct links to release assets:
```
https://github.com/zhuoli/confluence_assistant/releases/download/v3.0.0/Atlassian-AI-Assistant-3.0.0-arm64.dmg
```

#### 3. Self-Hosted Distribution

Upload installers to your own server/CDN and share download links.

### Installation Instructions for Users

**macOS Apple Silicon (M1/M2/M3/M4):**
1. Download the `.dmg` file
2. Open the DMG
3. Drag the app to Applications folder
4. **First time:** Right-click the app → Open (to bypass Gatekeeper)
5. On subsequent launches, just double-click to open

**System Requirements:**
- macOS 11.0 (Big Sur) or later
- Apple Silicon (M1, M2, M3, M4 chips)
- ~200MB disk space

---

## Code Signing (macOS)

For smooth distribution and to avoid security warnings, you should code-sign your app.

### Prerequisites

1. **Apple Developer Account** ($99/year)
2. **Developer ID Application Certificate** from Apple
3. **App-specific password** for notarization

### Setup Code Signing

1. **Get your certificate identity**:
   ```bash
   security find-identity -v -p codesigning
   ```

2. **Update `electron-app/package.json`** with signing config:
   ```json
   {
     "build": {
       "mac": {
         "category": "public.app-category.productivity",
         "hardenedRuntime": true,
         "gatekeeperAssess": false,
         "entitlements": "build/entitlements.mac.plist",
         "entitlementsInherit": "build/entitlements.mac.plist",
         "target": [
           {
             "target": "dmg",
             "arch": ["arm64"]
           }
         ]
       },
       "afterSign": "scripts/notarize.js"
     }
   }
   ```

3. **Set environment variables** for GitHub Actions:
   ```bash
   # In your repository settings → Secrets → Actions
   CSC_LINK=<base64-encoded-certificate>
   CSC_KEY_PASSWORD=<certificate-password>
   APPLE_ID=<your-apple-id>
   APPLE_ID_PASSWORD=<app-specific-password>
   APPLE_TEAM_ID=<your-team-id>
   ```

4. **Update the release workflow** to use signing:
   ```yaml
   - name: Build macOS ARM64 app
     run: cd electron-app && npm run build:mac
     env:
       CSC_LINK: ${{ secrets.CSC_LINK }}
       CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
       APPLE_ID: ${{ secrets.APPLE_ID }}
       APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
       APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
   ```

### Without Code Signing

If you don't have a Developer ID, users will see a security warning. They need to:
1. Right-click the app
2. Select "Open"
3. Click "Open" in the security dialog

This is required only on the first launch.

---

## Troubleshooting

### Build Fails on GitHub Actions

- **Check Node version**: Ensure workflow uses Node 18+
- **Check dependencies**: Verify `package-lock.json` is committed
- **Check logs**: View detailed logs in GitHub Actions tab

### DMG File Won't Open

- Rebuild with: `make clean && make package-mac`
- Ensure icon files exist: `electron-app/assets/icon.icns`

### App Won't Open (macOS Security)

Users need to:
1. System Settings → Privacy & Security
2. Scroll down and click "Open Anyway" for the app
3. OR: Right-click app → Open

### Building on Intel Mac

The workflow is configured for ARM64 (Apple Silicon). If you need Intel builds:
1. Change `arch: ["arm64"]` to `arch: ["x64"]` in `electron-app/package.json`
2. Or use `arch: ["arm64", "x64"]` for universal builds (larger file size)

---

## Architecture Details

### ARM64 (Apple Silicon) Specifics

The build is optimized for Apple Silicon:
- **Native ARM64 binary** - runs natively on M-series chips
- **No Rosetta 2 required** - full native performance
- **Smaller download size** - single architecture
- **Better battery life** - optimized for Apple Silicon efficiency

### Why ARM64 Only?

- All modern Macs (2021+) use Apple Silicon
- Better performance and battery life
- Simpler build process
- Smaller installer size

If you need Intel (x64) support for older Macs, update the build config to include both architectures (universal build).

---

## Next Steps

- ✅ Set up GitHub Actions workflows (Done!)
- ✅ Configure for Apple Silicon ARM64 (Done!)
- ⬜ Configure code signing for macOS
- ⬜ Add auto-update functionality (Electron Updater)
- ⬜ Set up crash reporting
- ⬜ Create installer customizations (license, welcome screens)

---

## Resources

- [Electron Builder Docs](https://www.electron.build/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Notarization Guide](https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/)
- [Apple Silicon Developer Guide](https://developer.apple.com/documentation/apple-silicon)
