# Quick Reference - Atlassian AI Assistant

## 🎯 Most Common Commands

```bash
# First time setup
make setup && make config

# Launch desktop app
make app

# Get Jira tasks
make cli-jira

# Search Confluence
make cli-confluence-search QUERY="deployment"

# Show all commands
make help
```

## 📋 Command Cheat Sheet

### Setup & Installation
| Command | Description |
|---------|-------------|
| `make setup` | Install everything (Python + Electron) |
| `make config` | Create configuration files |
| `make check-deps` | Verify dependencies installed |

### Desktop App
| Command | Description |
|---------|-------------|
| `make app` | Launch desktop app |
| `make app-dev` | Launch with DevTools |

### Python CLI - Jira
| Command | Description |
|---------|-------------|
| `make cli-jira` | Get sprint tasks |
| `make cli-jira-all` | Get all issues |

### Python CLI - Confluence
| Command | Description |
|---------|-------------|
| `make cli-confluence-search QUERY="text"` | Search pages |
| `make cli-confluence-recent` | Recent pages |

### Building
| Command | Description |
|---------|-------------|
| `make build-app-mac` | Build macOS .dmg |
| `make build-app-win` | Build Windows .exe |
| `make build-app-linux` | Build Linux packages |

### Maintenance
| Command | Description |
|---------|-------------|
| `make clean` | Clean build artifacts |
| `make status` | Show project status |
| `make test-config` | Validate configuration |

## 📂 Project Structure

```
confluence_assistant/
├── Makefile                # Main entry point - ALL COMMANDS HERE
├── README.md              # Main documentation
├── MAKEFILE_GUIDE.md      # Detailed Makefile guide
├── QUICK_REFERENCE.md     # This file
│
├── src/                   # Python CLI
│   ├── main.py
│   ├── agent.py
│   ├── jira_api.py
│   ├── confluence_api.py
│   └── ...
│
└── electron-app/          # Desktop App
    ├── src/
    │   ├── main/          # Electron main
    │   ├── renderer/      # UI
    │   └── backend/       # Business logic
    └── package.json
```

## 🔧 Configuration Files

- **`.env`** - Python CLI configuration
- **`electron-app/.env`** - Desktop app configuration

Both created by: `make config`

## 💡 Usage Examples

### Example 1: Daily Standup
```bash
make cli-jira                    # See my sprint tasks
# Review output, then:
make app                         # Chat with AI about priorities
```

### Example 2: Find Documentation
```bash
make cli-confluence-search QUERY="api guide"
# Or use desktop app:
make app
# Then ask: "Search for API documentation"
```

### Example 3: First Time Setup
```bash
git clone <repo>
cd confluence_assistant
make setup                       # Install (~2-3 min)
make config                      # Create .env files
# Edit .env files with your credentials
make app                         # Launch!
```

### Example 4: Build for Distribution
```bash
make setup                       # If not done
make config                      # Configure
# Edit electron-app/.env
make build-app-mac              # Creates .dmg file
# Share: electron-app/dist/*.dmg
```

## 🆘 Troubleshooting

### Configuration Issues
```bash
make status                      # Check status
make show-config                 # View config
make reset-config                # Start over
make config                      # Recreate files
```

### Installation Issues
```bash
make check-deps                  # Verify dependencies
make clean-all                   # Clean everything
make setup                       # Reinstall
```

### Connection Issues
```bash
make test-config                 # Test config validity
make test-jira                   # Test Jira connection
make test-confluence             # Test Confluence connection
```

## 📖 Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main documentation |
| `MAKEFILE_GUIDE.md` | Complete Makefile reference |
| `QUICK_REFERENCE.md` | This cheat sheet |
| `GETTING_STARTED.md` | Step-by-step guide |
| `CONFIGURATION_GUIDE.md` | Configuration details |
| `electron-app/README.md` | Desktop app documentation |
| `DESKTOP_APP_SUMMARY.md` | Desktop app overview |

## 🎓 Learning Path

1. **Start here**: `make help`
2. **Setup**: `make quick-start`
3. **Try it**: `make app` or `make cli-jira`
4. **Learn more**: Read `MAKEFILE_GUIDE.md`
5. **Build app**: `make build-app-mac`

## 💻 Platform Notes

- **macOS**: All commands work perfectly ✅
- **Linux**: All commands work perfectly ✅
- **Windows**: Use WSL or Git Bash for make commands

## 🔗 Quick Links

- Show all commands: `make` or `make help`
- Check status: `make status`
- Show structure: `make tree`
- View docs: `make docs`
- Version info: `make version`

---

**Remember**: Just type `make` to see all available commands!
