# 开发命令参考

## 开发

- `pnpm dev` - 启动本地开发服务器（Turbopack）
- `pnpm install` - 安装依赖

## 构建

- `pnpm build` - 生产构建（Turbopack）
- `pnpm start` - 启动生产服务器（需先 build）

## 检查

- `pnpm lint` - ESLint 检查所有文件
- `pnpm typecheck` - TypeScript 类型检查（tsc --noEmit）

## 测试

- `pnpm test` - Vitest watch 模式
- `pnpm test:run` - Vitest 单次运行（CI 模式）
- `pnpm vitest path/to/file.test.ts` - Vitest 单文件
- `pnpm vitest -t "test name"` - Vitest 按测试名筛选

## Git Hooks

- `pnpm prepare` - 安装 Husky git hooks
- Pre-commit: lint + typecheck（lint-staged）