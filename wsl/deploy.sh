#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# deploy.sh – Build and run pLearning in Docker (WSL)
# ──────────────────────────────────────────────────────────────
# Usage:
#   bash deploy.sh              → Build & start containers
#   bash deploy.sh --rebuild    → Force rebuild images
#   bash deploy.sh --stop       → Stop all containers
#   bash deploy.sh --logs       → Tail container logs
#   bash deploy.sh --status     → Show container status
#   bash deploy.sh --clean      → Stop & remove everything
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ────────────────────────────────────────────
PROJECT_NAME="plearning"
WSL_BASE_DIR="$HOME/projects/${PROJECT_NAME}"
APP_DIR="${WSL_BASE_DIR}/app"
LOG_DIR="${WSL_BASE_DIR}/logs"

ACTION="${1:---start}"

# ── Verify app directory ────────────────────────────────────
if [ ! -f "${APP_DIR}/docker-compose.yml" ]; then
    echo "❌ ERROR: docker-compose.yml not found in ${APP_DIR}"
    echo "   Run backup.sh first to sync the project."
    exit 1
fi

cd "${APP_DIR}"

# ── Helper functions ────────────────────────────────────────
header() {
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║   pLearning – Docker Deployment                        ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed or not in PATH"
        exit 1
    fi
    if ! docker info &> /dev/null 2>&1; then
        echo "❌ Docker daemon is not running. Start Docker first."
        exit 1
    fi
}

# ── Build frontend if needed ─────────────────────────────────
build_frontend() {
    if [ ! -d "${APP_DIR}/frontend/dist" ]; then
        echo "🔨 Building frontend..."
        if [ -f "${APP_DIR}/frontend/package.json" ]; then
            cd "${APP_DIR}/frontend"
            npm install
            npm run build
            cd "${APP_DIR}"
            echo "   ✅ Frontend built"
        else
            echo "   ⚠️  No package.json found, skipping frontend build"
        fi
    else
        echo "✅ Frontend dist/ already exists"
    fi
}

# ── Actions ─────────────────────────────────────────────────
case "${ACTION}" in
    --start|start)
        header
        check_docker
        build_frontend
        echo ""
        echo "🚀 Starting pLearning containers..."
        echo ""
        docker compose up -d --build
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "✅ pLearning is running!"
        echo ""
        echo "   🌐 Frontend:  http://localhost:3000"
        echo "   🔌 API:       http://localhost:8000"
        echo "   📋 API Docs:  http://localhost:8000/docs"
        echo ""
        echo "   Use 'deploy.sh --logs' to see container logs"
        echo "   Use 'deploy.sh --stop' to stop containers"
        echo "═══════════════════════════════════════════════════════════"
        ;;

    --rebuild|rebuild)
        header
        check_docker
        build_frontend
        echo ""
        echo "🔨 Rebuilding containers (no cache)..."
        docker compose build --no-cache
        docker compose up -d
        echo ""
        echo "✅ Containers rebuilt and started!"
        ;;

    --stop|stop)
        header
        echo "🛑 Stopping containers..."
        docker compose stop
        echo "✅ Containers stopped"
        ;;

    --logs|logs)
        mkdir -p "${LOG_DIR}"
        echo "📋 Tailing container logs (Ctrl+C to exit)..."
        echo "   Also saving to: ${LOG_DIR}/docker_$(date +%Y%m%d).log"
        docker compose logs -f 2>&1 | tee "${LOG_DIR}/docker_$(date +%Y%m%d).log"
        ;;

    --status|status)
        header
        echo "📊 Container Status:"
        echo ""
        docker compose ps
        echo ""
        echo "📦 Docker Images:"
        docker images | grep -i "${PROJECT_NAME}" || echo "   No project images found"
        echo ""
        echo "💾 Docker Volumes:"
        docker volume ls | grep -i "${PROJECT_NAME}" || echo "   No project volumes found"
        ;;

    --clean|clean)
        header
        echo "⚠️  This will stop and remove ALL pLearning containers,"
        echo "   images, and volumes (including database data)!"
        echo ""
        read -p "Are you sure? (y/N): " confirm
        if [[ "${confirm}" =~ ^[Yy]$ ]]; then
            docker compose down -v --rmi all
            echo ""
            echo "✅ Everything cleaned up"
        else
            echo "❌ Cancelled"
        fi
        ;;

    --help|help|-h)
        echo "Usage: deploy.sh [ACTION]"
        echo ""
        echo "Actions:"
        echo "  --start     Build & start containers (default)"
        echo "  --rebuild   Force rebuild images (no cache)"
        echo "  --stop      Stop all containers"
        echo "  --logs      Tail container logs"
        echo "  --status    Show container status"
        echo "  --clean     Stop & remove everything"
        echo "  --help      Show this help"
        ;;

    *)
        echo "❌ Unknown action: ${ACTION}"
        echo "   Run 'deploy.sh --help' for usage"
        exit 1
        ;;
esac
