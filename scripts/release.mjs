// Single source of truth for the version: package.json. The tag, the README pin and the site all follow it.
//   node scripts/release.mjs patch|minor|major|x.y.z [--push]   bump, commit and tag vX.Y.Z
//   node scripts/release.mjs --check                            fail when README, package.json or a tag on HEAD disagree
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim()
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const readme = readFileSync('README.md', 'utf8')
const pin = /github:DimitriDerthe\/nuxt-mica#v(\d+\.\d+\.\d+)/
const [arg, ...flags] = process.argv.slice(2)

if (arg === '--check') {
  const pinned = readme.match(pin)?.[1]
  const tags = git('tag', '--points-at', 'HEAD').split('\n').filter(t => /^v\d/.test(t))
  const errors = []
  if (pinned !== pkg.version) errors.push(`README pins v${pinned}, package.json is ${pkg.version}`)
  if (tags.length && !tags.includes(`v${pkg.version}`)) errors.push(`HEAD is tagged ${tags.join(', ')}, package.json is ${pkg.version}`)
  if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
  console.log(`version ${pkg.version} is consistent`)
  process.exit(0)
}

if (!arg) { console.error('usage: release.mjs patch|minor|major|x.y.z [--push] | --check'); process.exit(1) }
if (git('status', '--porcelain')) { console.error('Working tree is not clean.'); process.exit(1) }

const [maj, min, pat] = pkg.version.split('.').map(Number)
const next = { patch: `${maj}.${min}.${pat + 1}`, minor: `${maj}.${min + 1}.0`, major: `${maj + 1}.0.0` }[arg] ?? arg
if (!/^\d+\.\d+\.\d+$/.test(next)) { console.error(`Invalid version: ${next}`); process.exit(1) }
if (git('tag', '--list', `v${next}`)) { console.error(`Tag v${next} already exists.`); process.exit(1) }

pkg.version = next
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
writeFileSync('README.md', readme.replace(pin, `github:DimitriDerthe/nuxt-mica#v${next}`))
git('add', 'package.json', 'README.md')
git('commit', '-m', `chore(release): v${next}`)
git('tag', '-a', `v${next}`, '-m', `v${next}`)
if (flags.includes('--push')) git('push', '--follow-tags')
console.log(`Released v${next}${flags.includes('--push') ? ' and pushed.' : '. Push with: git push --follow-tags'}`)
