# Microservices Migration Plan

This repo now includes a strangler pattern bootstrap under `microservices/`.

## Current Status

- `api-gateway` is introduced as the single API entrypoint for microservice mode.
- `auth-service` is introduced as the first extracted service boundary.
- `auth-service` now serves `/api/auth` directly (standalone mode) using shared MongoDB collections.
- `room-service` now serves `/api/rooms` directly (standalone mode) using shared MongoDB collections.
- `notification-service` now serves `/api/notifications` and `/api/push` directly (standalone mode).
- `complaint-service` now serves `/api/complaints` directly (standalone mode).
- `food-service` now serves `/api/food` directly (standalone mode).
- `gallery-service` now serves `/api/gallery` directly (standalone mode).
- `feedback-service` now serves `/api/feedback` directly (standalone mode).
- `games-service` now serves `/api/games` directly (standalone mode).
- All other `/api/*` calls continue to go to monolith through gateway fallback.

## Run Modes

### Existing Monolith (unchanged)

```bash
npm run dev
```

### Migration Mode (local)

```bash
npm run dev:micro
```

Gateway runs at `http://localhost:5100`.

If running client locally in migration mode, set:

```env
VITE_API_URL=http://localhost:5100/api
```

### Docker Migration Mode

```bash
docker compose --profile micro up --build
```

Gateway will be exposed at `http://localhost:5100`.

## Phase Plan

1. Auth extraction
- Complete parity validation for all auth endpoints in `auth-service`.
- Move any remaining auth-adjacent concerns from monolith.
- Keep contracts stable while hardening observability and tests.

2. Room and user-profile extraction
- Complete parity validation for all room and hostel-record endpoints in `room-service`.
- Move any remaining room-adjacent concerns from monolith.

3. Notification extraction
- Complete parity validation for notifications and push-subscription endpoints.
- Move socket event emission to an event bus (Redis pub/sub first, then optional Kafka/NATS).

4. Content services extraction
- Complete parity validation for complaint APIs in `complaint-service`.
- Complete parity validation for food APIs in `food-service`.
- Complete parity validation for gallery APIs in `gallery-service`.
- Complete parity validation for feedback APIs in `feedback-service`.
- Complete parity validation for games APIs in `games-service`.

5. Shared concerns hardening
- API contracts (OpenAPI), tracing, centralized auth middleware, and service-to-service auth.

## Service Ownership Target

- `auth-service`: users, login, JWT, password reset, Google auth verification.
- `room-service`: hostel records, room allocation, occupancy constraints.
- `notification-service`: notices, push subscriptions, delivery orchestration.
- `content-service` (temporary aggregate): complaints, food, gallery, feedback, games.

## Guardrails

- Keep client API path stable (`/api/...`) via gateway.
- Extract one domain at a time and ship with parity tests.
- Do not break existing monolith endpoints until gateway route has fully switched.
