/** Longest description search engines show in full; longer ones are cut at a word boundary. */
const DESCRIPTION_MAX = 158

const clip = (s: string) => {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= DESCRIPTION_MAX) return t
  return t.slice(0, DESCRIPTION_MAX - 1).replace(/[\s,;:.]+\S*$/, '') + '…'
}

/** Page title and description, mirrored into the Open Graph and Twitter tags. Site-wide tags (image, locale, canonical) live in app.vue. */
export function useSiteSeo(title: () => string, description: () => string) {
  const text = () => clip(description())
  useHead(() => ({ title: title() }))
  useSeoMeta({
    description: text,
    ogTitle: title,
    ogDescription: text,
    twitterTitle: title,
    twitterDescription: text
  })
}
