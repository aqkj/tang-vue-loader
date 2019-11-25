/**
 * jsloader
 * @author xiaoqiang <465633678@qq.com>
 * @created 2019/10/31 10:28:15
 */
const { transpileModule } = require('typescript')
const path = require('path')
const hash = require('hash-sum')
const loaderUtils = require('loader-utils')
const fs = require('fs')
const { getRealComponentPath } = require('./utils')
module.exports = function (content) {
  console.log('content')
  const options = loaderUtils.getOptions(this)
  const entry = this._compiler.options.entry
  const entryKeys = Object.keys(entry)
  const entryKey = entryKeys.find(key => entry[key] === this.resourcePath)
  if (entryKey) {
    const text = transpileModule(content, {}).outputText
    let files = new Function(`var files = [];try {var exports = {};var require = function(src) { files.push(src);return { default: function() { return require }, path: src } }\n${text}\n} catch{}\nreturn files;`)()
    files = files.filter(file => path.extname(file) === '.vue')
    let importTemplate = ''
    // let importStyle = ''
    files.forEach((file, index) => {
      const realPath = getRealComponentPath(this.resourcePath, file)
      const templateId = hash(realPath)
      importTemplate = `<import src="${file}.wxml"/><template is="${templateId}" data="{{ ...rootData, ...componentData, componentData }}"/>`
      // importStyle =
      const vueContent = fs.readFileSync(realPath, {
        encoding: 'utf-8'
      })
      const ast = options.compiler.parseComponent(vueContent)
      const contents = ast.styles.map(style => {
        return style.content
      }).join('')
      if (contents.match(/\.*\{(.|\n)*\}/)) {
        console.log(realPath)
        // 添加依赖
        this.addDependency(realPath)
        // importStyle += `@import '${file}.wxss';\n`
      }
      // console.log(hasStyles, fileData)
    })
    // this.emitFile(entryKey + '.wxss', importStyle)
    this.emitFile(entryKey + '.wxml', importTemplate)
  }
  return content
}
