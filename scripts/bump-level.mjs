// Release level from Conventional Commits. Pure functions, shared by release.mjs (locally and in CI) and the tests.
//   BREAKING CHANGE footer or `type!:`  -> major (minor while the version is 0.x)
//   feat                                -> minor
//   fix, perf, refactor, style, revert, any non-conventional message -> patch
//   docs, chore, ci, test, build only   -> no release (null)

const LEVELS = ['patch', 'minor', 'major']
// Types that never change what a consumer of the layer gets.
const SILENT = new Set(['docs', 'chore', 'ci', 'test', 'build'])
const HEADER = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/

export function parseCommit(message) {
  const [header = '', ...body] = message.trim().split('\n')
  const m = header.match(HEADER)
  const breaking = !!m?.[3] || body.some(line => /^BREAKING[ -]CHANGE:/.test(line))
  return { type: m ? m[1].toLowerCase() : null, scope: m?.[2] ?? null, breaking, subject: m ? m[4] : header }
}

export function commitLevel(commit) {
  if (commit.breaking) return 'major'
  if (commit.type === 'feat') return 'minor'
  if (commit.type && SILENT.has(commit.type)) return null
  return 'patch'
}

// Highest level across the commits, or null when none of them needs a release.
export function bumpLevel(messages) {
  let best = -1
  for (const msg of messages) {
    const level = commitLevel(parseCommit(msg))
    if (level) best = Math.max(best, LEVELS.indexOf(level))
  }
  return best < 0 ? null : LEVELS[best]
}

// Before 1.0, a breaking change bumps the minor: 0.y.z makes no stability promise (semver §4).
export function releaseLevel(messages, version) {
  const level = bumpLevel(messages)
  return level === 'major' && version.startsWith('0.') ? 'minor' : level
}

export function nextVersion(version, level) {
  const [maj, min, pat] = version.split('.').map(Number)
  return { patch: `${maj}.${min}.${pat + 1}`, minor: `${maj}.${min + 1}.0`, major: `${maj + 1}.0.0` }[level]
}

// Markdown body for the GitHub release, grouped by impact.
export function releaseNotes(messages) {
  const groups = { 'Breaking changes': [], Features: [], Fixes: [], Other: [] }
  for (const msg of messages) {
    const c = parseCommit(msg)
    const level = commitLevel(c)
    if (!level) continue
    const line = `- ${c.scope ? `**${c.scope}:** ` : ''}${c.subject}`
    groups[c.breaking ? 'Breaking changes' : c.type === 'feat' ? 'Features' : c.type === 'fix' ? 'Fixes' : 'Other'].push(line)
  }
  return Object.entries(groups).filter(([, lines]) => lines.length)
    .map(([title, lines]) => `## ${title}\n\n${lines.join('\n')}`).join('\n\n') + '\n'
}
