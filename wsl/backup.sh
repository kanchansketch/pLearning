#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# backup.sh – Backup pLearning project from Windows → WSL
# ──────────────────────────────────────────────────────────────
# Usage:  bash backup.sh [--full]
#   --full    Include node_modules and .git (default: skip them)
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ────────────────────────────────────────────
PROJECT_NAME="plearning"
WSL_BASE_DIR="$HOME/projects/${PROJECT_NAME}"
WINDOWS_PROJECT="/mnt/c/Users/kanch/OneDrive/Desktop/Project/pLearning"
BACKUP_DIR="${WSL_BASE_DIR}/backups"
APP_DIR="${WSL_BASE_DIR}/app"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

FULL_BACKUP=false
if [[ "${1:-}" == "--full" ]]; then
    FULL_BACKUP=true
fi

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   pLearning – Backup & Sync                            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Verify Windows project exists ────────────────────────────
if [ ! -d "${WINDOWS_PROJECT}" ]; then
    echo "❌ ERROR: Windows project not found at:"
    echo "   ${WINDOWS_PROJECT}"
    echo ""
    echo "   Make sure the path is correct and WSL can access it."
    exit 1
fi

# ── Ensure directories exist ────────────────────────────────
mkdir -p "${BACKUP_DIR}" "${APP_DIR}"

# ── Step 1: Create timestamped backup archive ───────────────
echo "📦 Creating backup: backup_${TIMESTAMP}.tar.gz"

EXCLUDE_OPTS=(
    --exclude='node_modules'
    --exclude='.git'
    --exclude='__pycache__'
    --exclude='*.pyc'
    --exclude='.pytest_cache'
    --exclude='.coverage'
    --exclude='*.db'
    --exclude='.pLearning'
    --exclude='.venv'
    --exclude='venv'
)

if [ "${FULL_BACKUP}" = true ]; then
    echo "   Mode: FULL (including node_modules, .git)"
    EXCLUDE_OPTS=()
fi

tar czf "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" \
    "${EXCLUDE_OPTS[@]}" \
    -C "$(dirname "${WINDOWS_PROJECT}")" \
    "$(basename "${WINDOWS_PROJECT}")"

BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" | cut -f1)
echo "   ✅ Backup created (${BACKUP_SIZE})"
echo ""

# ── Step 2: Sync project to app/ directory ──────────────────
echo "🔄 Syncing project → ${APP_DIR}/"

rsync -av --delete \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.pytest_cache' \
    --exclude='.coverage' \
    --exclude='.pLearning' \
    --exclude='.venv' \
    --exclude='venv' \
    --exclude='*.db' \
    "${WINDOWS_PROJECT}/" "${APP_DIR}/"

echo ""

# ── Step 3: Clean up old backups (keep last 5) ──────────────
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "backup_*.tar.gz" -type f | wc -l)
if [ "${BACKUP_COUNT}" -gt 5 ]; then
    echo "🧹 Cleaning old backups (keeping last 5)..."
    find "${BACKUP_DIR}" -name "backup_*.tar.gz" -type f | \
        sort | head -n -5 | xargs rm -f
    echo "   ✅ Removed $((BACKUP_COUNT - 5)) old backup(s)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Backup & sync complete!"
echo ""
echo "   Backup:  ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
echo "   App dir: ${APP_DIR}/"
echo ""
echo "   Total backups: $(find "${BACKUP_DIR}" -name "backup_*.tar.gz" | wc -l)"
echo "═══════════════════════════════════════════════════════════"
