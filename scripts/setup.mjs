#!/usr/bin/env node
/**
 * One-shot setup helper for the monorepo.
 *   node scripts/setup.mjs   (or: npm run setup)
 *
 * - installs JS deps (root + workspaces)
 * - installs PHP deps for apps/api
 * - creates apps/api/.env from .env.example if missing, then key:generate
 * - runs migrate:fresh --seed
 *
 * Re-running is safe; existing .env is never overwritten.
 */
import { execSync } from 'node:child_process'
import { existsSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const api = join(root, 'apps', 'api')

const run = (cmd, cwd = root) => {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

run('npm install')
run('composer install', api)

const envPath = join(api, '.env')
if (!existsSync(envPath)) {
  copyFileSync(join(api, '.env.example'), envPath)
  console.log('✓ created apps/api/.env from .env.example')
  run('php artisan key:generate', api)
} else {
  console.log('• apps/api/.env already exists — skipping')
}

console.log('\nℹ Pastikan database MySQL & kredensial di apps/api/.env sudah benar.')
run('php artisan migrate:fresh --seed', api)

console.log('\n✅ Setup selesai. Jalankan: npm run dev')
