/**
 * 模版loader
 * @author xiaoqiang <465633678@qq.com>
 * @created 2019/10/25 23:14:36
 */
const { compile } = require('../../../../vue/packages/tang-template-compiler/index')
const qs = require('querystring')
const hash = require('hash-sum')
const { isHTMLTag, getRealPath, getRealComponentPath } = require('./utils')
const { getCacheFile } = require('../../codegen/utils')
// const roots = {}
module.exports = function (source) {
  const { ast } = compile(source)
  const query = qs.parse(this.resourceQuery.slice(1))
  // 获取组件
  const { components } = getCacheFile(this.resourcePath)
  // 获取scopedId
  const scopedId = query.scoped ? `data-v-${query.id}` : ''
  // 获取文件绝对地址
  const filePath = getRealPath(this.resourcePath)
  // 生成模版id
  const templateId = hash(filePath)
  // 组件槽
  const componentIndex = 0
  // 拼接模版
  const template = `<template name="${templateId}">${getGenWxml().call(this, ast, scopedId, components, componentIndex)}</template>`
  this.emitFile(this.resourcePath.replace(/src\//, '').replace(process.cwd(), '') + '.wxml', template)
}
// 自闭和标签
const selfClose = ['input', 'img', 'br', 'hr']
const eventsMap = {
  click: 'tap',
  input: 'input'
}
/**
 * 生成wxml
 */
function getGenWxml () {
  // 组件index
  let componentIndex = 0
  return function genWxml (ast, scopedId, components) {
    const {
      tag,
      // type,
      // attrsMap = {},
      classBinding,
      staticClass = '',
      children = [],
      text = '',
      events = [],
      attrs = [],
      props = []
      // directives
    } = ast
    // console.log(ast)
    // 判断不是html的标签
    if (!tag) return text
    if (!isHTMLTag(tag)) {
      // 判断是否存在组件
      if (components[tag]) {
        // 获取组件绝对路径
        const filePath = getRealComponentPath(this.resourcePath, components[tag].path)
        // 生产组件模版id
        const templateId = hash(filePath)
        // 导入组件
        return `<import src="${components[tag].path}.wxml"/><template is="${templateId}" data="{{ ...componentData[(parentComponentStr || '') + 'componentData_${componentIndex}'], componentData, parentComponentStr: (parentComponentStr || '') + 'componentData_${componentIndex++}' }}"/>`
      }
    }
    let childrenStr = ''
    let attrStr = ''
    let eventStr = ''
    let className = ''
    if (staticClass) {
      className = className + ' class=' + staticClass.slice(0, -1) + ' ' + scopedId + '"'
    } else if (scopedId) {
      className = ` class="${scopedId}"`
    }
    if (classBinding) {

    }
    // 遍历子ast
    if (children.length) {
      children.forEach(node => {
        childrenStr += genWxml.call(this, node, scopedId, components)
      })
    }
    attrs.concat(props).forEach(attr => {
      if (attr.name === 'eventkey') attrStr += ` data-${attr.name}=${attr.value}`
      else attrStr += ` ${attr.name}=${typeof attr.dynamic === 'undefined' ? attr.value : `"{{${attr.value}}}"`}`
    })
    // 遍历属性
    // Object.keys(attrsMap).forEach(key => {
    //   if(!key.match(/^[v\-|\:|\@]/)) {
    //     attrStr += ` ${key}="${attrsMap[key]}"`
    //   }
    // })
    Object.keys(events).forEach(event => {
      const name = eventsMap[event] || event
      eventStr += ` bind:${name}="proxyEventHandler"`
    })
    return `<${tag}${className}${attrStr}${eventStr}${selfClose.indexOf(tag) >= 0 ? '/>' : `>${text}${childrenStr}</${tag}>`}`
  }
}
