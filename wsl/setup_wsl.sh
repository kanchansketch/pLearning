#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# setup_wsl.sh – Create proper folder structure in WSL
#                for pLearning application
# ──────────────────────────────────────────────────────────────
# Usage:  Run this ONCE inside WSL to set up the directory tree.
#         bash setup_wsl.sh
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ────────────────────────────────────────────
PROJECT_NAME="plearning"
WSL_BASE_DIR="$HOME/projects/${PROJECT_NAME}"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   pLearning – WSL Folder Structure Setup                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Create directory tree ────────────────────────────────────
echo "📁 Creating directory structure at: ${WSL_BASE_DIR}"
echo ""

mkdir -p "${WSL_BASE_DIR}"/{app,backups,data,logs,scripts,nginx}

# app/       → Project source code (synced from Windows)
# backups/   → Timestamped backups of the project
# data/      → Persistent data (DB, uploads, etc.)
# logs/      → Application and Docker logs
# scripts/   → Deployment & maintenance scripts
# nginx/     → Nginx configuration

echo "  ├── app/        → Project source code"
echo "  ├── backups/    → Timestamped project backups"
echo "  ├── data/       → Persistent data (DB, uploads)"
echo "  ├── logs/       → Application & Docker logs"
echo "  ├── scripts/    → Deployment scripts"
echo "  └── nginx/      → Nginx config"
echo ""

# ── Copy scripts to WSL scripts/ dir ────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "${SCRIPT_DIR}/backup.sh" ]; then
    cp "${SCRIPT_DIR}/backup.sh" "${WSL_BASE_DIR}/scripts/"
    chmod +x "${WSL_BASE_DIR}/scripts/backup.sh"
    echo "✅ Copied backup.sh → scripts/"
fi

if [ -f "${SCRIPT_DIR}/deploy.sh" ]; then
    cp "${SCRIPT_DIR}/deploy.sh" "${WSL_BASE_DIR}/scripts/"
    chmod +x "${WSL_BASE_DIR}/scripts/deploy.sh"
    echo "✅ Copied deploy.sh → scripts/"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ WSL folder structure created successfully!"
echo ""
echo "Next steps:"
echo "  1. Run backup.sh to copy project from Windows → WSL"
echo "  2. Run deploy.sh to build & start Docker containers"
echo "═══════════════════════════════════════════════════════════"
