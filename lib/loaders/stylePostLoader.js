const qs = require('querystring')
const { compileStyle } = require('@vue/component-compiler-utils')
// This is a post loader that handles scoped CSS transforms.
// Injected right before css-loader by the global pitcher (../pitch.js)
// for any <style scoped> selection requests initiated from within vue files.
module.exports = function (source, inMap) {
  const query = qs.parse(this.resourceQuery.slice(1))
  const { code, map, errors } = compileStyle({
    source,
    filename: this.resourcePath,
    id: `data-v-${query.id}`,
    map: inMap,
    scoped: !!query.scoped,
    trim: true
  })
  if (errors.length) {
    this.callback(errors[0])
  } else {
    // 兼容处理css
    const nCode = code.replace(/\[(data\-v\-.*)\]/g, '.$1') || ''
    // const { components = {}} = getCacheFile(this.resourcePath)
    // const keys = Object.keys(components) || []
    // console.log(components)
    // 获取所有组件
    // keys.forEach(key => {
    //   let { inTemplate, path: cPath } = components[key]
    //   const extname = path.extname(cPath)
    //   // 获取组件是否存在样式
    //   const componentHasStyles = getCacheFile(getRealComponentPath(this.resourcePath, cPath) + 'styles')
    //   // 设置样式路径
    //   cPath = extname ? cPath + '.wxss' : cPath + '.vue.wxss'
    //   if (inTemplate && componentHasStyles) {
    //     nCode = `@import '${cPath}';\n${nCode}`
    //   }
    // })
    // this.emitFile(this.resourcePath.replace(/src\//, '').replace(process.cwd(), '') + '.wxss', nCode)
    // console.log(getCacheFile(this.resourcePath))
    this.callback(null, nCode, map)
  }
}
