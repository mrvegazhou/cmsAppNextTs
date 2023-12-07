import { ContentState, genKey } from "draft-js";


const buildColgroup = (blockData: any) => {
    if (blockData && blockData.colgroupData && blockData.colgroupData.length) {
      return `<colgroup>${blockData.colgroupData.map((col: { width: any; }) => `<col width="${col.width}"></col>`).join('')}</colgroup>`
    }
  
    return ''
}

export const tableExportFn = (exportAttrString: string) => (contentState: ContentState, block: any) => {
    if (block.type.toLowerCase() !== 'table-cell') {
        return null
    }
    const previousBlock = contentState.getBlockBefore(block.key)
    const nextBlock = contentState.getBlockAfter(block.key)
    const previousBlockType = previousBlock ? previousBlock.getType() : null
    const previousBlockData = previousBlock ? previousBlock.getData().toJS() : {}
    const nextBlockType = nextBlock ? nextBlock.getType() : null
    const nextBlockData = nextBlock ? nextBlock.getData().toJS() : {}
    
    let start = ''
    let end = ''
    let blockStyle = ''

    if (block.data.textAlign) {
        blockStyle += `text-align:${block.data.textAlign}; `
    }

    if (block.data.cellBg) {
        blockStyle += ` background-color: rgba(33, 37, 41, 0.3) !important; border: 1px solid #c5c5c5;`;
    }
    blockStyle = blockStyle!='' ? ' style="'+blockStyle+'" ' : '';

    if (previousBlockType !== 'table-cell') {
        start = `<table class="re-table" ${exportAttrString}>${buildColgroup(block.data)}<tr><td${blockStyle} colSpan="${block.data.colSpan}" rowSpan="${block.data.rowSpan}">`
    } else if (previousBlockData.rowIndex !== block.data.rowIndex) {
        start = `<tr><td${blockStyle} colSpan="${block.data.colSpan}" rowSpan="${block.data.rowSpan}">`
    } else {
        start = `<td${blockStyle} colSpan="${block.data.colSpan}" rowSpan="${block.data.rowSpan}">`
    }

    if (nextBlockType !== 'table-cell') {
        end = '</td></tr></table>'
    } else if (nextBlockData.rowIndex !== block.data.rowIndex) {
        end = '</td></tr>'
    } else {
        end = '</td>'
    }
    
    if (!previousBlockType) {
        start = '<p></p>' + start
    }
    
    if (!nextBlockType) {
        end += '<p></p>'
    }

    return { start, end }
};


// 遍历以修正单元格的colSpan和rowSpan属性（表格DOM专用）
export const rebuildTableNode = (tableNode: any) => {

    const tableKey = genKey()
    const skipedCells: any = {};
  
    [].forEach.call(tableNode.rows, (row, rowIndex) => {
    // @ts-ignore
      [].forEach.call(row.cells, (cell, cellIndex) => {
  
        let colIndex = cellIndex
        let xx, yy
  
        for (; skipedCells[rowIndex] && skipedCells[rowIndex][colIndex]; colIndex++) {/*_*/ }
  
        const { rowSpan, colSpan } = cell
  
        if (rowSpan > 1 || colSpan > 1) {
  
          for (xx = rowIndex; xx < rowIndex + rowSpan; xx++) {
            for (yy = colIndex; yy < colIndex + colSpan; yy++) {
              skipedCells[xx] = skipedCells[xx] || {}
              skipedCells[xx][yy] = true
            }
          }
  
        }
        // @ts-ignore
        cell.innerHTML = cell.innerHTML.replace(/\n\s*$/, '')
        // @ts-ignore
        cell.dataset.tableKey = tableKey
        // @ts-ignore
        cell.dataset.colIndex = colIndex
        // @ts-ignore
        cell.dataset.rowIndex = rowIndex
  
      })
  
    })
  
}
const parseColgoupData = (colgroupNode: any) => {
    if (!colgroupNode) {
      return []
    }
    return Array.prototype.map.call(colgroupNode.querySelectorAll('col'), colNode => {
      return {
        width: colNode.width ? colNode.width * 1 : 0
      }
    })
}
let tableColgroupData: any = []
export const tableImportFn = (nodeName: string, node: any) => {
    if (nodeName !== 'body' && node && node.querySelector && node.querySelector(':scope > table')) {
        node.parentNode.insertBefore(node.querySelector(':scope > table'), node.nextSibling)
    }
    if (nodeName === 'table') {
        tableColgroupData = parseColgoupData(node.querySelector('colgroup'))
        rebuildTableNode(node)
    }

    if (nodeName === 'th' || nodeName === 'td') {
        const tableKey = node.dataset.tableKey
        const colIndex = node.dataset.colIndex * 1
        const rowIndex = node.dataset.rowIndex * 1
        const colSpan = node.colSpan
        const rowSpan = node.rowSpan
    
        const cellData = { tableKey, colIndex, rowIndex, colSpan, rowSpan, colgroupData: tableColgroupData }
        // @ts-ignore
        cellData.isHead = nodeName === 'th'
    
        if (node.style && node.style.textAlign) {
            // @ts-ignore
            cellData.textAlign = node.style.textAlign
        } else if (node.align) {
            // @ts-ignore
            cellData.textAlign = node.align
        }
    
        return {
            type: 'table-cell',
            data: cellData
        }
    }
};