/** Page title and description, mirrored into the Open Graph and Twitter tags. Site-wide tags (image, locale, canonical) live in app.vue. */
export function useSiteSeo(title: () => string, description: () => string) {
  useHead(() => ({ title: title() }))
  useSeoMeta({
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description
  })
}
