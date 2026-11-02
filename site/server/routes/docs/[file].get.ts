// The layer's group guides (docs/buttons.md, docs/foundations.md...), served as plain markdown.
import { isSafeMarkdownFileName } from '../../utils/docs'

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file') ?? ''
  if (!isSafeMarkdownFileName(file)) throw createError({ statusCode: 404 })
  const text = await useStorage('assets:mica').getItem<string>(`docs:${file}`)
  if (!text) throw createError({ statusCode: 404 })
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  return text
})
