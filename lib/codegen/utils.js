const qs = require('querystring')

// these are built-in query parameters so should be ignored
// if the user happen to add them as attrs
const ignoreList = [
  'id',
  'index',
  'src',
  'type'
]
const fileData = {}
// transform the attrs on a SFC block descriptor into a resourceQuery string
exports.attrsToQuery = (attrs, langFallback) => {
  let query = ``
  for (const name in attrs) {
    const value = attrs[name]
    if (!ignoreList.includes(name)) {
      query += `&${qs.escape(name)}=${value ? qs.escape(value) : ``}`
    }
  }
  if (langFallback && !(`lang` in attrs)) {
    query += `&lang=${langFallback}`
  }
  return query
}
// 换成文件数据
exports.cacheFile = function (filePath, data) {
  fileData[filePath] = data
}
// 获取缓存数据
exports.getCacheFile = function (filePath) {
  return fileData[filePath]
}
exports.fileData = fileData
