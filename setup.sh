#!/bin/bash

echo "====================================="
echo "Atlassian AI Assistant Setup"
echo "====================================="
echo ""

echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Found Python $PYTHON_VERSION"

echo ""
echo "Creating Python virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
    echo ""
    echo "IMPORTANT: Please edit .env and configure:"
    echo "  - ANTHROPIC_API_KEY"
    echo "  - JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN"
    echo "  - CONFLUENCE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN"
    echo ""
else
    echo ".env file already exists, skipping..."
fi

echo ""
echo "====================================="
echo "Setup Complete!"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials:"
echo "   - Get Anthropic API key from https://console.anthropic.com/"
echo "   - Create Personal Access Tokens in your Atlassian instance"
echo "   - See README.md for detailed authentication instructions"
echo ""
echo "2. Activate the virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "3. Run the agent:"
echo "   python -m src.main jira              # Get Jira issues"
echo "   python -m src.main confluence search \"query\"  # Search Confluence"
echo ""
echo "4. Get help:"
echo "   python -m src.main --help"
echo ""
