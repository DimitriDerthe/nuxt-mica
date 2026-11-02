// Single source of truth for the version: package.json. The tag, the README pin and the site all follow it.
//   node scripts/release.mjs patch|minor|major|x.y.z [--push]   bump, commit and tag vX.Y.Z
//   node scripts/release.mjs auto [--dry-run] [--notes file] [--push]
//                                    level from the Conventional Commits since the last tag (see bump-level.mjs);
//                                    exits 0 without releasing when only docs/chore/ci/test/build commits landed
//   node scripts/release.mjs --check                            fail when README, package.json or a tag on HEAD disagree
import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { nextVersion, releaseLevel, releaseNotes } from './bump-level.mjs'

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

if (!arg) { console.error('usage: release.mjs patch|minor|major|x.y.z|auto [--dry-run] [--notes file] [--push] | --check'); process.exit(1) }

// In GitHub Actions, expose the result to later steps.
const output = (key, value) => process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`)
const flag = name => { const i = flags.indexOf(name); return i < 0 ? undefined : flags[i + 1] }

let level = arg
if (arg === 'auto') {
  let range = 'HEAD'
  try { range = `${git('describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*')}..HEAD` } catch { /* no tag yet: every commit counts */ }
  const log = git('log', '--no-merges', '--format=%B%x00', range)
  const messages = log.split('\0').map(m => m.trim()).filter(Boolean)
  level = releaseLevel(messages, pkg.version)
  if (flag('--notes')) writeFileSync(flag('--notes'), releaseNotes(messages))
  if (!level) {
    console.log(`No release: ${messages.length} commit(s) since ${range.split('..')[0]}, only docs, chore, ci, test or build.`)
    output('released', 'false')
    process.exit(0)
  }
  console.log(`${messages.length} commit(s) in ${range}: ${level} bump`)
}

const next = nextVersion(pkg.version, level) ?? level
if (flags.includes('--dry-run')) { console.log(`Would release v${next}`); process.exit(0) }
if (git('status', '--porcelain')) { console.error('Working tree is not clean.'); process.exit(1) }
if (!/^\d+\.\d+\.\d+$/.test(next)) { console.error(`Invalid version: ${next}`); process.exit(1) }
if (git('tag', '--list', `v${next}`)) { console.error(`Tag v${next} already exists.`); process.exit(1) }

pkg.version = next
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
writeFileSync('README.md', readme.replace(pin, `github:DimitriDerthe/nuxt-mica#v${next}`))
git('add', 'package.json', 'README.md')
git('commit', '-m', `chore(release): v${next}`)
git('tag', '-a', `v${next}`, '-m', `v${next}`)
if (flags.includes('--push')) git('push', '--atomic', 'origin', 'HEAD', `v${next}`)
output('released', 'true')
output('version', next)
console.log(`Released v${next}${flags.includes('--push') ? ' and pushed.' : '. Push with: git push --follow-tags'}`)
