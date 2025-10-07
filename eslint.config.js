import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier,
        },
        rules: {
            'prettier/prettier': 'off',
            "no-unused-vars": "off",
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
        },
        ignores: ['dist', 'node_modules'],
    },
];
