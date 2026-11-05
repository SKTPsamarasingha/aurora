import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            // Maps '@' directly to the root directory to match your tsconfig
            '@': path.resolve(__dirname, './'),
        },
    },
    test: {
        setupFiles: ["tests/setup.ts"],
        globals: true,
        environment: 'node',
    },
});
