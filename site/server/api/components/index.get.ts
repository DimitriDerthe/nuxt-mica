// Component list for the explorer index and sidebar.
export default defineEventHandler(event => components
  .filter(c => !rootOf(c.name))
  .map(c => localize(c, String(getQuery(event).lang ?? '')))
  .map(({ name, group, summary, props }) => ({ name, group, summary, vmodel: props.some(p => p.name === 'modelValue') }))
  .sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || a.name.localeCompare(b.name)))
