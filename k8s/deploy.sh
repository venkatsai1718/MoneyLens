#!/usr/bin/env bash
# Deploys MoneyLens to EKS: ECR login -> cross-platform build -> push ->
# kubectl apply -> wait for rollout.
#
# Every deploy builds and pushes a fresh, unique tag (git hash + timestamp).
# k8s/deployment-file.yml's image field holds the marker string
# "moneylens-latest" (not a real, pushed tag) — this script substitutes it
# for the real tag with `sed` and applies the result, so the cluster always
# sees a new image string and Kubernetes rolls out automatically.
#
# Usage: ./deploy.sh [--tag TAG] [--region REGION] [--dry-run]
#   --tag TAG        Override the generated tag.
#   --region REGION   AWS region (default: us-east-1)
#   --dry-run         Build and push the image, but skip kubectl apply.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Configuration ────────────────────────────────────────────────────────
AWS_REGION="us-east-1"
ECR_REGISTRY="029533636646.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPOSITORY="my_ecr"
TAG="moneylens-$(date +'%d.%m.%Y.%H.%M.%S')"
K8S_MANIFEST="${ROOT_DIR}/k8s/deployment-file.yml"
DEPLOYMENT_NAME="moneylens-app"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)     TAG="$2";       shift 2 ;;
    --region)  AWS_REGION="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true;   shift 1 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

IMAGE="${ECR_REGISTRY}/${ECR_REPOSITORY}:${TAG}"

echo "================================================"
echo " MoneyLens — EKS Deploy"
echo "================================================"
echo " kubectl context: $(kubectl config current-context)"
echo " Image:           ${IMAGE}"
echo " Manifest:        ${K8S_MANIFEST}"
echo " Dry run:         ${DRY_RUN}"
echo

# ── 1. Log Docker in to ECR ──────────────────────────────────────────────
echo "==> Logging in to ${ECR_REGISTRY}"
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
echo

# ── 2. Cross-platform build + push (EKS nodes are linux/amd64; a build on
# Apple Silicon defaults to arm64, which won't run there without this) ────
echo "==> Registering QEMU binfmt handlers"
docker run --privileged --rm tonistiigi/binfmt --install amd64 2>&1 | grep -v "^$" || true
echo

echo "==> Building ${IMAGE} (linux/amd64) and pushing"
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -f "${ROOT_DIR}/Dockerfile" \
  -t "${IMAGE}" \
  --push \
  "${ROOT_DIR}"
echo

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "==> Dry run — skipping kubectl apply."
  echo "    Image pushed: ${IMAGE}"
  exit 0
fi

# ── 3. Apply the Kubernetes manifest ─────────────────────────────────────
# k8s/deployment-file.yml keeps the marker "moneylens-latest" committed in
# git; swap it for this run's real tag and apply the result, never the raw
# file, so a plain `kubectl apply -f k8s/deployment-file.yml` never
# accidentally references an image that was never pushed.
echo "==> Applying ${K8S_MANIFEST}"
sed -e "s|moneylens-latest|${TAG}|g" "${K8S_MANIFEST}" | kubectl apply -f -
echo

# ── 4. Wait for the rollout ──────────────────────────────────────────────
echo "==> Waiting for rollout"
kubectl rollout status "deployment/${DEPLOYMENT_NAME}"
echo

echo "================================================"
echo " Deploy complete."
echo " Image: ${IMAGE}"
echo "================================================"
echo
echo "Watch it with:"
echo "  kubectl get pods -w"
echo "  kubectl get svc moneylens-service -w   # EXTERNAL-IP column = ELB DNS name (can take a few minutes)"
