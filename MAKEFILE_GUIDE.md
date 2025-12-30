# Makefile Command Guide

All project operations are available through simple `make` commands.

## Quick Start (3 Commands)

```bash
make setup      # Install everything
make config     # Create configuration files
make app        # Launch the desktop app
```

## All Available Commands

Run `make help` or just `make` to see all available commands:

```bash
make help
```

## Command Categories

### 🚀 Setup & Installation

```bash
make setup              # Setup both Python CLI and Electron app
make setup-python       # Setup Python CLI only
make setup-electron     # Setup Electron app only
make config             # Create .env configuration files
make check-deps         # Check if dependencies are installed
```

### 💻 Python CLI Commands

```bash
make cli-jira                                    # Get Jira sprint tasks
make cli-jira-all                                # Get all Jira issues
make cli-confluence-search QUERY="api docs"     # Search Confluence
make cli-confluence-recent                       # Get recent pages
make cli-help                                    # Show CLI help
```

### 🖥️ Electron Desktop App

```bash
make app          # Launch the desktop app
make app-dev      # Launch with DevTools (development)
```

### 📦 Building & Distribution

```bash
make build-all         # Build for all platforms
make build-app-mac     # Build macOS .dmg
make build-app-win     # Build Windows .exe
make build-app-linux   # Build Linux .AppImage/.deb
```

### 🧪 Testing & Validation

```bash
make test-config       # Test configuration validity
make test-jira         # Test Jira connection
make test-confluence   # Test Confluence connection
```

### 🧹 Maintenance

```bash
make clean             # Clean build artifacts
make clean-all         # Clean everything (including dependencies)
make reset-config      # Reset configuration files
```

### 📚 Documentation & Info

```bash
make docs              # List documentation files
make show-config       # Show current config (hides sensitive data)
make version           # Show version information
make status            # Show project status
make tree              # Show project structure
```

### ⚡ Quick Start Examples

```bash
make quick-start       # Complete setup with guidance
make demo-python       # Demo Python CLI features
```

## Common Workflows

### First Time Setup

```bash
make setup          # Install all dependencies
make config         # Create configuration files
# Edit .env files with your credentials
make status         # Verify setup
make app            # Launch the app!
```

### Daily Usage - Desktop App

```bash
make app            # Launch and chat with your assistant
```

### Daily Usage - Python CLI

```bash
make cli-jira                              # Check your sprint
make cli-confluence-search QUERY="deploy" # Search docs
```

### Building for Distribution

```bash
make build-app-mac    # Build macOS app
# Share the .dmg file from electron-app/dist/
```

### Troubleshooting

```bash
make status           # Check what's installed
make test-config      # Validate configuration
make clean            # Clean and rebuild
make setup            # Reinstall if needed
```

## Environment Variables

You can pass environment variables to make commands:

```bash
# Use different space for Confluence
make test-confluence SPACE=TEAM

# Search with specific query
make cli-confluence-search QUERY="deployment guide"
```

## Examples

### Example 1: Complete Setup
```bash
# Clone and setup
git clone <repo>
cd confluence_assistant
make quick-start

# Follow prompts, then:
make app
```

### Example 2: Python CLI Workflow
```bash
# Setup Python only
make setup-python
make config

# Edit .env, then:
make cli-jira           # See your tasks
make cli-jira-all       # See all issues
```

### Example 3: Build Distribution
```bash
# Setup and build
make setup
make config

# Edit electron-app/.env, then:
make build-app-mac

# Result: electron-app/dist/Atlassian-AI-Assistant-1.0.0.dmg
```

### Example 4: Development Workflow
```bash
# Work on desktop app
make app-dev           # Launch with DevTools

# Make changes to code...

make clean             # Clean builds
make app-dev           # Test changes
```

## Targets Explained

### Setup Targets

- **`make setup`**: Installs both Python and Electron environments
- **`make setup-python`**: Creates Python venv, installs packages
- **`make setup-electron`**: Installs npm packages
- **`make config`**: Copies `.env.example` to `.env` (won't overwrite)

### CLI Targets

- **`make cli-jira`**: Runs `python -m src.main jira`
- **`make cli-jira-all`**: Adds `--all-issues` flag
- **`make cli-confluence-search`**: Requires `QUERY` parameter

### App Targets

- **`make app`**: Runs `npm start` in electron-app
- **`make app-dev`**: Runs `npm run dev` (opens DevTools)

### Build Targets

- **`make build-app-mac`**: Uses electron-builder for macOS
- **`make build-app-win`**: Uses electron-builder for Windows
- **`make build-app-linux`**: Uses electron-builder for Linux

### Maintenance Targets

- **`make clean`**: Removes `__pycache__`, `dist/`, build artifacts
- **`make clean-all`**: Also removes `venv/`, `node_modules/`
- **`make reset-config`**: Deletes `.env` files

## Tips

1. **See all commands**: Just run `make` or `make help`

2. **Check status anytime**: `make status`

3. **Tab completion**: Most shells support tab completion for make targets

4. **Chain commands**:
   ```bash
   make clean && make setup && make app
   ```

5. **Parallel builds**:
   ```bash
   make -j4 build-all  # Build faster with 4 parallel jobs
   ```

6. **Dry run**:
   ```bash
   make -n app  # Show what would run without running it
   ```

7. **Silent mode**:
   ```bash
   make -s cli-jira  # Less output
   ```

## Color-Coded Output

The Makefile uses color coding:
- 🔵 **Blue**: Informational messages
- 🟢 **Green**: Success messages
- 🟡 **Yellow**: Warnings
- 🔴 **Red**: Errors

## Platform Notes

### macOS
All commands work as-is.

### Linux
All commands work as-is.

### Windows
Use WSL (Windows Subsystem for Linux) or Git Bash to run make commands.

## Getting Help

- **General help**: `make help`
- **Python CLI help**: `make cli-help`
- **Electron help**: See `electron-app/README.md`
- **Full docs**: `make docs`

## Troubleshooting Make

### "make: command not found"

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt-get install build-essential  # Debian/Ubuntu
sudo yum install make                  # RHEL/CentOS
```

**Windows:**
Install via Chocolatey or use WSL

### "No rule to make target"

Make sure you're in the project root directory:
```bash
cd /path/to/confluence_assistant
make help
```

### Makefile Won't Run

Check for syntax errors:
```bash
make -n help  # Dry run to check syntax
```
