export const unique = (array: Array<any>) => {
  const obj: { [index: string]: any } = {}
  array.forEach(v => obj[v] = true)
  return Object.keys(obj)
}