#!/bin/bash

echo "======================================"
echo "   Gmail Organizer - Setup Script    "
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing required packages..."
pip install -r requirements.txt

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTICE:"
echo "1. NEVER share your password with anyone!"
echo "2. Change your Gmail password immediately!"
echo "3. Enable 2-factor authentication"
echo ""
echo "Next steps:"
echo "1. Get your credentials.json from Google Cloud Console"
echo "2. Place it in this directory"
echo "3. Run: python gmail_organizer.py"
echo ""
echo "To activate the environment later, run:"
echo "source venv/bin/activate"
echo "======================================"