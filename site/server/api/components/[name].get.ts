// Full API entry of one component, by name (MiButton).
export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'name')
  const entry = components.find(c => c.name === name)
  if (!entry) throw createError({ statusCode: 404, statusMessage: `Unknown component ${name}` })
  const root = rootOf(entry.name)
  const lang = String(getQuery(event).lang ?? '')
  const parts = components.filter(c => rootOf(c.name) === entry.name).map(c => ({ name: c.name, summary: localize(c, lang).summary }))
  return { ...localize(entry, lang), root, parts }
})
