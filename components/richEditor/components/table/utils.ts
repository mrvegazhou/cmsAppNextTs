import { 
    EditorState, 
    genKey, 
    ContentBlock, 
    ContentState, 
    CharacterMetadata, 
    EditorChangeType,
    BlockMap,
    SelectionState
} from "draft-js"
import Immutable from 'immutable'
import { selectionContainsStrictBlock } from "../../utils/content"

const createUnstyledBlock = () => {
    const key = genKey()
    return [key, new ContentBlock({
      key: key,
      type: 'unstyled',
      text: '',
      data: Immutable.Map({}),
      characterList: Immutable.List([])
    })]
}

// 创建并返回一个单元格block
const createCellBlock = (cell: any) => {

    cell = {
      colSpan: 1,
      rowSpan: 1,
      text: '',
      ...cell
    }
  
    const { tableKey, key, colIndex, rowIndex, colSpan, rowSpan, text, isHead } = cell

    return new ContentBlock({
      key: key || genKey(),
      type: 'table-cell',
      text: text,
      data: Immutable.Map({ tableKey, colIndex, rowIndex, colSpan, rowSpan, isHead }),
      characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.create(), text.length))
    })
  
}

// 插入表格
export const insertTable = (editorState: EditorState, columns = 3, rows = 3) => {

    if (selectionContainsStrictBlock(editorState)) {
      return editorState
    }
  
    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
  
    const tableKey = genKey()
    const cellBlocks = [createUnstyledBlock()]
  
    for (var ii = 0; ii < rows; ii++) {
      for (var jj = 0; jj < columns; jj++) {
        let cellBlock = createCellBlock({
          tableKey: tableKey,
          colIndex: jj,
          rowIndex: ii,
        })
        cellBlocks.push([cellBlock.getKey(), cellBlock])
      }
    }
  
    cellBlocks.push(createUnstyledBlock())

    const startKey = selectionState.getStartKey()
    const currentBlock = contentState.getBlockForKey(startKey)

    const blocksBefore = contentBlocks.toSeq().takeUntil((block) => {
      return block === currentBlock
    })
  
    const blocksAfter = contentBlocks.toSeq().skipUntil((block) => {
      return block === currentBlock
    }).rest()
  
    const tableBlocks = Immutable.OrderedMap(cellBlocks).toSeq()
  
    const firstCellKey = cellBlocks[1][0]
    const nextContentBlocks = blocksBefore.concat(
      Immutable.OrderedMap([[startKey, currentBlock]]).toSeq(),
      tableBlocks,
      blocksAfter
    ).toOrderedMap()
  
    const nextContentState = contentState.merge({
      blockMap: nextContentBlocks,
      selectionBefore: selectionState,
      selectionAfter: selectionState.merge({
        // @ts-ignore
        anchorKey: firstCellKey,
        anchorOffset: selectionState.getStartOffset(),
        focusKey: firstCellKey,
        focusOffset: selectionState.getStartOffset(),
        isBackward: false
      })
    })

    return EditorState.push(editorState, nextContentState as ContentState, 'insert-table' as EditorChangeType) 
}

// 简易的值比较方法
const valueComparison = (value1: any, value2: any, operator: string) => {

    switch (operator) {
      case '==':
        return value1 == value2
      case '>=':
        return value1 >= value2
      case '<=':
        return value1 <= value2
      case '>':
        return value1 > value2
      case '<':
        return value1 < value2
    } 
}

// 使用简易值比较函数筛选符合条件的block
const findBlocks = (contentBlocks: BlockMap, propName: any, propValue: any, operator = '==') => {

    return contentBlocks.filter((block) => {
      return valueComparison(block!.getData().get(propName), propValue, operator) as boolean;
    })
  
}

// 获取指定范围内的单元格block
export const getCellsInsideRect = (editorState: EditorState, tableKey: string, startLocation: any, endLocation: any) => {

    const [startColIndex, startRowIndex] = startLocation
    const [endColIndex, endRowIndex] = endLocation
  
    const leftColIndex = Math.min(startColIndex, endColIndex)
    const rightColIndex = Math.max(startColIndex, endColIndex)
    const upRowIndex = Math.min(startRowIndex, endRowIndex)
    const downRowIndex = Math.max(startRowIndex, endRowIndex)
  
    const matchedCellLocations: number[][] = []
  
    for (let ii = leftColIndex; ii <= rightColIndex; ii++) {
      for (let jj = upRowIndex; jj <= downRowIndex; jj++) {
        matchedCellLocations.push([ii, jj])
      }
    }
  
    if (matchedCellLocations.length === 0) {
      return Immutable.OrderedMap([])
    }
  
    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)
  
    const matchedCellBlockKeys: string[] = []
    const spannedCellBlockKeys: string[] = []
  
    let matchedCellBlocks: Immutable.List<ContentBlock> = Immutable.List([])
    let spannedCellBlocks: Immutable.List<ContentBlock> = Immutable.List([])
  
    tableBlocks.forEach(block => {
  
      const blockData = block!.getData()
      const blockKey = block!.getKey()
      const colIndex = blockData.get('colIndex')
      const rowIndex = blockData.get('rowIndex')
      const colSpan = blockData.get('colSpan')
      const rowSpan = blockData.get('rowSpan')
  
      matchedCellLocations.forEach(([x, y]) => {
  
        if (colIndex === x && rowIndex === y) {
          matchedCellBlockKeys.indexOf(blockKey) === -1 && (matchedCellBlocks = matchedCellBlocks.push(block!)) && matchedCellBlockKeys.push(blockKey);
          (colSpan > 1 || rowSpan > 1) && (spannedCellBlockKeys.indexOf(blockKey) === -1) && (spannedCellBlocks = spannedCellBlocks.push(block!)) && spannedCellBlockKeys.push(blockKey)
        } else if (colSpan > 1 || rowSpan > 1) {
          if ((colIndex <= x && colIndex + colSpan > x && rowIndex <= y && rowIndex + rowSpan > y)) {
            (spannedCellBlockKeys.indexOf(blockKey) === -1) && (spannedCellBlocks = spannedCellBlocks.push(block!)) && spannedCellBlockKeys.push(blockKey)
          }
        }
  
      })
  
    })
  
    return {
      cellBlocks: matchedCellBlocks.merge(spannedCellBlocks),
      cellKeys: [...matchedCellBlockKeys, ...spannedCellBlockKeys], // todo: 去重复
      spannedCellBlocks: spannedCellBlocks,
      spannedCellBlockKeys: spannedCellBlockKeys
    }
}


// 合并单元格
export const mergeCells = (editorState: EditorState, tableKey: string, cellKeys: string[]) => {

    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
  
    const cellBlocksData: any[] = []
    let mergedText = ''
    // @ts-ignore
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey).filter(block => {
        if (block) {
            if (~cellKeys.indexOf(block.getKey())) {
  
                mergedText += block.getText()
          
                cellBlocksData.push({
                  key: block.getKey(),
                  ...block.getData().toJS()
                })
                return false
          
            } else {
                return true
            }
        }
    })
  
    const sortedCellBlocksData = cellBlocksData.sort((prev, next) => (next.colIndex + next.rowIndex) - (prev.colIndex + prev.rowIndex))
  
    const firstCellData = sortedCellBlocksData.slice(-1)[0]
    const lastCellData = sortedCellBlocksData[0]
    const mergedCell = contentState.getBlockForKey(firstCellData.key).merge({
      'text': mergedText,
      'data': Immutable.Map({
        ...firstCellData,
        colSpan: lastCellData.colIndex - firstCellData.colIndex + 1,
        rowSpan: lastCellData.rowIndex - firstCellData.rowIndex + 1
      }),
      characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.create(), mergedText.length))
    })
  
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), firstCellData.key, insertCell(tableBlocks as ContentBlock, mergedCell), tableKey)
  
    return EditorState.push(editorState, nextContentState as ContentState, 'merge-table-cell' as EditorChangeType) 
}

// 将表格block更新到contentState
const updateTableBlocks = (contentState: ContentState, selection: SelectionState, focusKey: string, tableBlocks: Immutable.Iterable<string, ContentBlock>, tableKey: string) => {

    const contentBlocks = contentState.getBlockMap().toSeq()
  
    const blocksBefore = contentBlocks.takeUntil(block => {
      return block!.getData().get('tableKey') === tableKey
    })
    // @ts-ignore
    const blocksAfter = contentBlocks.skipUntil((block, key) => {
      const nextBlockKey = contentState.getKeyAfter(key!)
      return block!.getData().get('tableKey') === tableKey && nextBlockKey && contentState.getBlockForKey(nextBlockKey).getData().get('tableKey') !== tableKey
    }).rest()
  
    return contentState.merge({
      blockMap: blocksBefore.concat(tableBlocks, blocksAfter).toOrderedMap(),
      selectionBefore: selection,
      selectionAfter: selection.merge({
        anchorKey: focusKey,
        anchorOffset: 0,
        focusKey: focusKey,
        focusOffset: 0,
        hasFocus: false,
        isBackward: false
      })
    })
}

// 插入一个单元格block到表格的block列表中
export const insertCell = (tableBlocks: ContentBlock, cell: any) => {

    let colIndex: number, rowIndex: number, cellBlock
  
    if (cell instanceof ContentBlock) {
      colIndex = cell.getData().get('colIndex')
      rowIndex = cell.getData().get('rowIndex')
      cellBlock = cell
    } else {
      colIndex = cell.colIndex
      rowIndex = cell.rowIndex
      cellBlock = createCellBlock(cell)
    }
  
    const blocksBefore = tableBlocks.takeUntil(block => {
      const blockRowIndex = block!.getData().get('rowIndex')
      const blockColIndex = block!.getData().get('colIndex')
      // @ts-ignore
      return (blockColIndex >= colIndex && blockRowIndex === rowIndex) || blockRowIndex > rowIndex
    })
  
    const blocksAfter = tableBlocks.skipUntil(block => {
      const blockRowIndex = block!.getData().get('rowIndex')
      const blockColIndex = block!.getData().get('colIndex')
      // @ts-ignore
      return (blockColIndex >= colIndex && blockRowIndex === rowIndex) || blockRowIndex > rowIndex
    })
  
    const nextTableBlocks = blocksBefore.concat(Immutable.OrderedMap([[cellBlock.getKey(), cellBlock]]).toSeq(), blocksAfter)
  
    return nextTableBlocks
}

// 拆分单元格
export const splitCell = (editorState: EditorState, tableKey: string, cellKey: string) => {

    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
  
    const cellsToBeAdded: any = []
  
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey).map(block => {
  
      if (block!.getKey() === cellKey) {
  
        const blockData = block!.getData().toJS()
        const { colIndex, rowIndex, colSpan, rowSpan } = blockData
  
        if (colSpan === 1 && rowSpan === 1) {
          return block
        }
  
        for (var ii = colIndex; ii < colIndex + colSpan; ii++) {
          for (var jj = rowIndex; jj < rowIndex + rowSpan; jj++) {
            if (ii !== colIndex || jj !== rowIndex) {
              cellsToBeAdded.push({
                text: '',
                tableKey: tableKey,
                colIndex: ii,
                rowIndex: jj,
                colSpan: 1,
                rowSpan: 1
              })
            }
          }
        }
  
        return block!.merge({
          'data': Immutable.Map({
            ...blockData,
            colSpan: 1,
            rowSpan: 1
          })
        })
  
      } else {
        return block
      }
  
    })
  
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), cellKey, insertCells(tableBlocks as ContentBlock, cellsToBeAdded), tableKey)
  
    return EditorState.push(editorState, nextContentState as ContentState, 'merge-table-cell' as EditorChangeType) 
}

// 插入多个单元格block到表格的block列表中
export const insertCells = (tableBlocks: ContentBlock, cells: any[] = []) => {
    // @ts-ignore
    return cells.reduce((nextTableBlocks, cell) => {
      return insertCell(nextTableBlocks, cell)
    }, tableBlocks)
}

// 删除整个表格
export const removeTable = (editorState: EditorState, tableKey: string) => {

    if (!tableKey) {
      return editorState
    }
  
    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)
    
    // @ts-ignore
    const nextContentBlocks = contentBlocks.filter(block => {
      if (block!.getType() === 'table-cell' && block!.getData().get('tableKey') === tableKey) {
        return false
      } else {
        return true
      }
    })
  
    const focusCellKey = (tableBlocks.first() ? (contentState.getBlockBefore(tableBlocks.first().getKey()) || nextContentBlocks.first()) : nextContentBlocks.first()).getKey()
  
    const nextContentState = contentState.merge({
      blockMap: nextContentBlocks,
      selectionBefore: selectionState,
      selectionAfter: selectionState.merge({
        anchorKey: focusCellKey,
        anchorOffset: selectionState.getStartOffset(),
        focusKey: focusCellKey,
        focusOffset: selectionState.getStartOffset(),
        isBackward: false
      })
    })
    return EditorState.push(editorState, nextContentState as ContentState, 'remove-table' as EditorChangeType)
}

// 插入一列单元格到表格中
export const insertColumn = (editorState: EditorState, tableKey: string, cellCounts: number, colIndex: number) => {

    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)
    const cellsToBeAdded = []
  
    if (colIndex === 0) {
  
      for (let ii = 0; ii < cellCounts; ii++) {
        cellsToBeAdded.push({
          text: '',
          colIndex: 0,
          rowIndex: ii,
          colSpan: 1,
          rowSpan: 1,
          tableKey: tableKey
        })
      }
  
    }
  
    const nextTableBlocks = tableBlocks.map(block => {
  
      const blockData = block!.getData().toJS()
      const { colIndex: blockColIndex, rowIndex: blockRowIndex, colSpan: blockColSpan, rowSpan: blockRowSpan } = blockData
      const nextColIndex = blockColIndex < colIndex ? blockColIndex : blockColIndex + 1
      const nextColSpan = blockColIndex < colIndex && blockColSpan > 1 && blockColIndex + blockColSpan > colIndex ? blockColSpan + 1 : blockColSpan
  
      const needUpdate = nextColIndex !== blockColIndex || nextColSpan !== blockColSpan
  
      if ((blockColSpan === 1 && blockColIndex === colIndex - 1) || (blockColSpan > 1 && blockColIndex + blockColSpan === colIndex)) {
  
        for (let jj = blockRowIndex; jj < blockRowIndex + blockRowSpan; jj++) {
          cellsToBeAdded.push({
            text: '',
            colIndex: colIndex,
            rowIndex: jj,
            colSpan: 1,
            rowSpan: 1,
            tableKey: tableKey
          })
        }
  
      }
  
      return needUpdate ? block!.merge({
        data: Immutable.Map({
          ...blockData,
          colIndex: nextColIndex,
          colSpan: nextColSpan
        })
      }) : block
  
    })
  
    if (cellsToBeAdded.length === 0) {
      return editorState
    }
    // @ts-ignore
    const focusCellKey = cellsToBeAdded[0].key = genKey()
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), focusCellKey, insertCells(nextTableBlocks as ContentBlock, cellsToBeAdded), tableKey)
  
    return EditorState.push(editorState, nextContentState as ContentState, 'insert-table-column' as EditorChangeType)
}

// 从表格中移除指定的某一列单元格
export const removeColumn = (editorState: EditorState, tableKey: string, colIndex: number) => {

    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap().toSeq()
    // @ts-ignore
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)
    
    // @ts-ignore
    const cellsToBeAdded = findBlocks(tableBlocks as BlockMap, 'colIndex', colIndex).reduce((cellsToBeAdded, block) => {
  
      const { colIndex, rowIndex, colSpan, rowSpan } = block!.getData().toJS()
  
      if (colSpan > 1) {
        // @ts-ignore
        cellsToBeAdded.push({
          text: block!.getText(),
          tableKey: tableKey,
          colIndex: colIndex,
          rowIndex: rowIndex,
          colSpan: colSpan - 1,
          rowSpan: rowSpan
        })
      }
  
      return cellsToBeAdded
  
    }, [])
  
    const nextTableBlocks = tableBlocks.filter(block => {
      return block!.getData().get('colIndex') * 1 !== colIndex
    }).map(block => {
  
      const blockData = block!.getData().toJS()
      const { colIndex: blockColIndex, colSpan: blockColSpan } = blockData
  
      const newColIndex = blockColIndex > colIndex ? blockColIndex - 1 : blockColIndex
      const newColSpan = blockColIndex < colIndex && blockColIndex + blockColSpan > colIndex ? blockColSpan - 1 : blockColSpan
      const needUpdate = newColIndex !== blockColIndex || newColSpan !== blockColSpan
  
      return needUpdate ? block!.merge({
        'data': {
          ...blockData,
          colIndex: newColIndex,
          colSpan: newColSpan
        }
      }) : block
  
    })
    // @ts-ignore
    const focusCellKey = (nextTableBlocks.first() || contentState.getBlockBefore(tableBlocks.first().getKey()) || contentState.getBlockAfter(tableBlocks.first().getKey())).getKey()
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), focusCellKey, insertCells(nextTableBlocks as ContentBlock, cellsToBeAdded), tableKey)
  
    return EditorState.push(editorState, nextContentState as ContentState, 'remove-table-column' as EditorChangeType) 
}

// 插入一行单元格到表格中
export const insertRow = (editorState: EditorState, tableKey: string, cellCounts: number, rowIndex: number, addonBlockData = {}) => {

    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap().toSeq()
    // @ts-ignore
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)
    // @ts-ignore
    const blocksBefore = findBlocks(tableBlocks, 'rowIndex', rowIndex, '<').map(block => {
  
      const blockData = block!.getData().toJS()
      const { rowIndex: blockRowIndex, rowSpan: blockRowSpan } = blockData
  
      if (blockRowIndex > rowIndex) {
        return block
      } else {
  
        const needUpdate = blockRowSpan && blockRowIndex + blockRowSpan > rowIndex
        const newRowSpan = needUpdate ? blockRowSpan * 1 + 1 : blockRowSpan
  
        return block!.merge({
          'data': Immutable.Map({
            ...blockData, rowSpan: newRowSpan
          })
        })
  
      }
  
    })
    
    // @ts-ignore
    const blocksAfter = findBlocks(tableBlocks, 'rowIndex', rowIndex, '>=').map(block => {
  
      const blockData = block!.getData().toJS()
  
      return block!.merge({
        'data': Immutable.Map({
          ...blockData,
          rowIndex: blockData.rowIndex * 1 + 1
        })
      })
  
    })
  
    const colCellLength = getCellCountForInsert(tableBlocks as BlockMap, rowIndex)
    const rowBlocks = createRowBlocks(tableKey, rowIndex, colCellLength || cellCounts)
    // @ts-ignore
    const focusCellKey = rowBlocks.first().getKey()
  
    const nextTableBlocks = rebuildTableBlocks(blocksBefore.concat(rowBlocks, blocksAfter), addonBlockData)
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), focusCellKey, nextTableBlocks, tableKey)
  
    return EditorState.push(editorState, nextContentState as ContentState, 'insert-table-row' as EditorChangeType)
}

// 遍历以修正单元格的colIndex属性（表格blocks专用）
export const rebuildTableBlocks = (tableBlocks: any, addonBlockData = {}) => {

    const skipedCells: any = {}
    const cellCountOfRow: any = []
    // @ts-ignore
    return tableBlocks.map(block => {
  
      const blockData = block.getData()
      const rowIndex = blockData.get('rowIndex')
      const colSpan = blockData.get('colSpan') || 1
      const rowSpan = blockData.get('rowSpan') || 1
  
      cellCountOfRow[rowIndex] = cellCountOfRow[rowIndex] || 0
      cellCountOfRow[rowIndex]++
  
      const cellIndex = cellCountOfRow[rowIndex] - 1
  
      let colIndex = cellIndex
      let xx, yy
        // @ts-ignore
      for (; skipedCells[rowIndex] && skipedCells[rowIndex][colIndex]; colIndex++ , cellCountOfRow[rowIndex]++);
  
      if (rowSpan > 1 || colSpan > 1) {
  
        for (xx = rowIndex; xx < rowIndex + rowSpan; xx++) {
          for (yy = colIndex; yy < colIndex + colSpan; yy++) {
            skipedCells[xx] = skipedCells[xx] || {}
            skipedCells[xx][yy] = true
          }
        }
  
      }
  
      return block.merge({
        'data': Immutable.Map({
          ...blockData.toJS(),
          ...addonBlockData,
          colIndex: colIndex
        })
      })
  
    }) 
}

// 创建并返回一行单元格block
const createRowBlocks = (tableKey: string, rowIndex: number, rowLength: number, firstCellText = '') => {

    const cells = Immutable.Range(0, rowLength).map((index) => {
  
      var cellBlock = createCellBlock({
        tableKey: tableKey,
        colIndex: index,
        rowIndex: rowIndex,
        text: index === 0 ? firstCellText : ''
      })
  
      return [cellBlock.getKey(), cellBlock]
  
    }).toArray()
    return Immutable.OrderedMap(cells).toSeq()
}

// 获取需要插入到某一行的单元格的数量
export const getCellCountForInsert = (tableBlocks: BlockMap, rowIndex: number) => {

    return findBlocks(tableBlocks, 'rowIndex', rowIndex).reduce((count, block) => {
      return count! + (block!.getData().get('colSpan') || 1) * 1
    }, 0)
}


// 从表格中移除指定的某一行单元格
export const removeRow = (editorState: EditorState, tableKey: string, rowIndex: number, addonBlockData: any) => {

    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap().toSeq()
    // @ts-ignore
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)
    // @ts-ignore
    const blocksBefore = findBlocks(tableBlocks, 'rowIndex', rowIndex, '<').map(block => {
  
      const blockData = block!.getData().toJS()
      const { rowIndex: blockRowIndex, rowSpan: blockRowSpan } = blockData
  
      if (blockRowIndex > rowIndex) {
        return block
      } else {
  
        const needUpdate = blockRowSpan && blockRowIndex + blockRowSpan > rowIndex
        const newRowSpan = needUpdate ? blockRowSpan * 1 - 1 : blockRowSpan
  
        return block!.merge({
          'data': Immutable.Map({
            ...blockData, rowSpan: newRowSpan
          })
        })
  
      }
  
    })
    // @ts-ignore
    const blocksAfter = findBlocks(tableBlocks, 'rowIndex', rowIndex, '>').map(block => {
  
      const blockData = block!.getData().toJS()
  
      return block!.merge({
        'data': Immutable.Map({
          ...blockData,
          rowIndex: blockData.rowIndex * 1 - 1
        })
      })
  
    })
    // @ts-ignore
    const cellsToBeAdded = findBlocks(tableBlocks, 'rowIndex', rowIndex).reduce((cellsToBeAdded, block) => {
  
      const { colIndex, rowIndex, colSpan, rowSpan } = block!.getData().toJS()
  
      if (rowSpan > 1) {
        // @ts-ignore
        cellsToBeAdded.push({
          text: block!.getText(),
          tableKey: tableKey,
          colIndex: colIndex,
          rowIndex: rowIndex,
          colSpan: colSpan,
          rowSpan: rowSpan - 1
        })
      }
  
      return cellsToBeAdded
  
    }, [])
    // @ts-ignore
    const focusCellKey = (blocksAfter.first() || blocksBefore.last() || contentBlocks.first()).getKey()
    const nextTableBlocks = rebuildTableBlocks(insertCells(blocksBefore.concat(blocksAfter) as ContentBlock, cellsToBeAdded), addonBlockData)
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), focusCellKey, nextTableBlocks, tableKey)
  
    return EditorState.push(editorState, nextContentState as ContentState, 'remove-table-row' as EditorChangeType)
}

export const updateAllTableBlocks = (editorState: EditorState, tableKey: string, blockData: any) => {
    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)

    const nextTableBlocks = rebuildTableBlocks(tableBlocks, blockData)
    // @ts-ignore
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), selectionState.focusKey, nextTableBlocks, tableKey)
  
    return EditorState.push(editorState, nextContentState as ContentState, 'insert-table-row' as EditorChangeType)
}

export const updateCellBg = (editorState: EditorState, tableKey: string, extraData: {rowIndex:number;colIndex:number}[]) => {
    const selectionState = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const contentBlocks = contentState.getBlockMap()
    const tableBlocks = findBlocks(contentBlocks, 'tableKey', tableKey)

    // @ts-ignore
    const nextTableBlocks = tableBlocks.map(block => {
  
      const blockData = block!.getData()
      const rowIndex = blockData.get('rowIndex')
      const colIndex = blockData.get('colIndex')
  
      let isBg = extraData.find((ele) => ele.rowIndex==rowIndex && ele.colIndex==colIndex);

      return block!.merge({
        'data': Immutable.Map({
            ...blockData.toJS(),
            cellBg: typeof isBg != 'undefined' ? true : false
        })
      })
    })
    
    // @ts-ignore
    const nextContentState = updateTableBlocks(contentState, editorState.getSelection(), selectionState.focusKey, nextTableBlocks, tableKey)
    return EditorState.push(editorState, nextContentState as ContentState, 'insert-table-row' as EditorChangeType)
};

