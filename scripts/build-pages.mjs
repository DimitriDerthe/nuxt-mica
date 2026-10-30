// Builds the static GitHub Pages bundle into ./pages-dist: the marketing site at the root and the playground demos under /demo.
// Usage: node scripts/build-pages.mjs [repoName]   (repo name = the Pages sub-path; default "nuxt-mica", "" for a user/organisation site)
import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs'

const repo = process.argv[2] ?? 'nuxt-mica'
const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'DimitriDerthe'
const base = repo ? `/${repo}/` : '/'
const origin = `https://${owner.toLowerCase()}.github.io`
const run = (cmd, env) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } })

rmSync('pages-dist', { recursive: true, force: true })

// Demos first: the site links to them.
run('pnpm exec nuxt generate .playground', { NUXT_APP_BASE_URL: `${base}demo/` })
run('pnpm exec nuxt generate site', {
  NUXT_APP_BASE_URL: base,
  NUXT_PUBLIC_SHOWCASE_URL: `${base}demo/showcase`,
  // i18n appends the app base path itself, so this is the bare origin.
  NUXT_PUBLIC_I18N_BASE_URL: origin,
  NUXT_PUBLIC_REPO_URL: `https://github.com/${owner}/nuxt-mica`
})

cpSync('site/.output/public', 'pages-dist', { recursive: true })
cpSync('.playground/.output/public', 'pages-dist/demo', { recursive: true })
// Pages runs Jekyll by default, which drops the _nuxt and _i18n folders.
writeFileSync('pages-dist/.nojekyll', '')
if (!existsSync('pages-dist/index.html')) throw new Error('pages-dist/index.html is missing')
console.log(`\nPages bundle ready in pages-dist (served at ${origin}${base})`)
