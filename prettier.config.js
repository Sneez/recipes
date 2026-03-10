/** @type {import('@trivago/prettier-plugin-sort-imports').PluginConfig & import('prettier').Config} */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^react', // React imports first
    '^@?\\w', // External packages (zod, @tanstack/*, etc.)
    '^@recipe-app/(.*)', // Workspace packages
    '^@api/(.*)', // API path alias
    '^@/(.*)', // Web path alias
    '^[./]', // Relative imports (should be rare)
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
