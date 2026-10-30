// The layer's generated AI-friendly docs, served as plain markdown (/docs/api/MiButton.md).
export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file') ?? ''
  if (!/^Mi[A-Za-z]+\.md$/.test(file)) throw createError({ statusCode: 404 })
  const text = await useStorage('assets:mica').getItem<string>(`docs:api:${file}`)
  if (!text) throw createError({ statusCode: 404 })
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return text
})
