.PHONY: check lint typecheck test-run test build dev

check:
	pnpm lint && pnpm typecheck && pnpm test:run

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test-run:
	pnpm test:run

test:
	pnpm test

build:
	pnpm build

dev:
	pnpm dev
