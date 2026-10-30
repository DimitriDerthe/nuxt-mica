// The layer's llms.txt, served at the site root so assistants can fetch it.
export default defineEventHandler(async (event) => {
  const text = await useStorage('assets:mica').getItem<string>('llms.txt')
  if (!text) throw createError({ statusCode: 404 })
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return text
})
