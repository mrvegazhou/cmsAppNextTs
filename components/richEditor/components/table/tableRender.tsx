import { EditorState } from 'draft-js';
import React from 'react'
import { 
    getCellsInsideRect, 
    mergeCells, 
    splitCell, 
    removeTable, 
    insertColumn, 
    removeColumn, 
    insertRow, 
    removeRow,
    updateAllTableBlocks,
    updateCellBg
} from './utils';
import "./tableRender.scss";
import { createEditorState, toRAW } from '../../utils/convert';

type ColToolHandlersType = React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>[];
interface TableInfoState {
    tableRows: React.ReactNode[][];
    colToolHandlers: ColToolHandlersType;
    rowToolHandlers: any[];
    defaultColWidth: number;
    colResizing: boolean;
    colResizeOffset: number;
    selectedCells: any[];
    selectedRowIndex: number;
    selectedColumnIndex: number;
    setFirstRowAsHead: boolean;
    dragSelecting: boolean;
    draggingRectBounding: React.CSSProperties | undefined;
    cellsMergeable: boolean;
    cellSplittable: boolean | number;
    contextMenuPosition: {top: number; left: number;} | null;
}
type TableRenderProps = {
    readOnly: boolean;
    onChange: Function;
    editorState: EditorState;
    columnResizable: boolean;
    children?: any[];
    requestBlur?: Function;
}

class TableRenderer extends React.Component<TableRenderProps, TableInfoState> {
    state: TableInfoState = {
        tableRows: [],
        colToolHandlers: [],
        rowToolHandlers: [],
        defaultColWidth: 0,
        colResizing: false,
        colResizeOffset: 0,
        selectedCells: [],
        selectedRowIndex: -1,
        selectedColumnIndex: -1,
        setFirstRowAsHead: false,
        dragSelecting: false,
        draggingRectBounding: undefined,
        cellsMergeable: false,
        cellSplittable: false,
        contextMenuPosition: null
    };
    
    showContextMenu: boolean = false;
    __tableRef: React.LegacyRef<HTMLTableElement>;
    __colRefs: any = {}
    __rowRefs: any = {}
    tableKey: string = ""

    __colResizeIndex = 0
    __colResizeStartAt = 0

    __startCellKey = null
    __endCellKey = null

    __dragSelecting = false
    __dragSelected = false
    __dragSelectingStartColumnIndex: string | undefined | null = null
    __dragSelectingStartRowIndex: string | undefined | null = null
    __dragSelectingEndColumnIndex: string | undefined | null = null
    __dragSelectingEndRowIndex: string | undefined | null = null
    __draggingRectBoundingUpdating = false
    __selectedCellsCleared = false

    __draggingStartPoint: {x: number; y: number} = {x:0, y:0}
    

    colLength: number;
    constructor(props: TableRenderProps) {
        super(props);
        this.colLength = 0;
        this.__tableRef = React.createRef();
    }

    componentDidMount() {
        this.renderCells(this.props)
        // @ts-ignore
        document.body.addEventListener('keydown', this.handleKeyDown, false)
        // @ts-ignore
        document.body.addEventListener('mousemove', this.handleMouseMove, false)
        // @ts-ignore
        document.body.addEventListener('mouseup', this.handleMouseUp, false)
    }
    
    UNSAFE_componentWillReceiveProps(nextProps: TableRenderProps) {
        this.renderCells(nextProps)
    }
    
    componentWillUnmount() {
        // @ts-ignore
        document.body.removeEventListener('keydown', this.handleKeyDown, false)
        // @ts-ignore
        document.body.removeEventListener('mousemove', this.handleMouseMove, false)
        // @ts-ignore
        document.body.removeEventListener('mouseup', this.handleMouseUp, false)
    }

    handleKeyDown = (event: React.KeyboardEvent<Element>) => {
        if (event.keyCode === 8) {
          const { selectedColumnIndex, selectedRowIndex } = this.state;
    
          if (selectedColumnIndex > -1) {
            //removeColumn()
            event.preventDefault()
          } else if (selectedRowIndex > -1) {
            //removeRow()
            event.preventDefault()
          }
        }
    }

    handleMouseMove = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (this.state.colResizing) {
            this.setState({
                colResizeOffset: this.getResizeOffset(event.clientX - this.__colResizeStartAt)
            })
        }
    }

    getResizeOffset = (offset: number) => {
        let leftLimit = 0
        let rightLimit = 0
    
        const { colToolHandlers, defaultColWidth } = this.state;
        // @ts-ignore
        leftLimit = -1 * ((colToolHandlers[this.__colResizeIndex - 1].width || defaultColWidth) - 30)
        // @ts-ignore
        rightLimit = (colToolHandlers[this.__colResizeIndex].width || defaultColWidth) - 30
    
        offset = offset < leftLimit ? leftLimit : offset
        offset = offset > rightLimit ? rightLimit : offset
    
        return offset
    }

    handleMouseUp = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {

    };


    ////////////////////////////////////---begin cell---/////////////////////////////////////////////////////////

    selectCell = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const { selectedCells } = this.state
        const { cellKey } = event.currentTarget.dataset
        // @ts-ignore
        const { colSpan, rowSpan } = event.currentTarget
    
        const nextSelectedCells = ~selectedCells.indexOf(cellKey) ? [] : [cellKey]
        const cellSplittable = nextSelectedCells.length && (colSpan > 1 || rowSpan > 1)
    
        this.setState({
          selectedCells: nextSelectedCells,
          cellSplittable: cellSplittable,
          cellsMergeable: false,
          selectedRowIndex: -1,
          selectedColumnIndex: -1,
        }, this.renderCells)
    }

    handleCellContexrMenu = (event: React.MouseEvent<HTMLElement>) => {
        const { selectedCells } = this.state
        const { cellKey } = event.currentTarget.dataset
    
        if (!~selectedCells.indexOf(cellKey)) {
          this.selectCell(event)
        }
        // @ts-ignore
        const { top: tableTop, left: tableLeft, width: tableWidth } = this.__tableRef.current.getBoundingClientRect();
        let top = event.clientY - tableTop + 15
        let left = event.clientX - tableLeft + 10
    
        if (left + 150 > tableWidth) {
          left = tableWidth - 150
        }
    
        this.setState({
          contextMenuPosition: { top, left }
        })
    
        event.preventDefault()
    }
    
    handleCellMouseDown = (event: React.MouseEvent<HTMLElement>) => {
        if (this.state.colResizing) {
          event.stopPropagation()
          return false
        }
        this.__dragSelecting = true
        this.__dragSelectingStartColumnIndex = event.currentTarget.dataset.colIndex
        this.__dragSelectingStartRowIndex = event.currentTarget.dataset.rowIndex
    
        this.__draggingStartPoint = {
          x: event.clientX,
          y: event.clientY
        }
    
        this.setState({
          dragSelecting: true
        })
    }
    
    handleCellMouseUp = () => {
        this.__dragSelecting = false
        this.__dragSelected = false
        this.__dragSelectingStartColumnIndex = null
        this.__dragSelectingStartRowIndex = null
        this.__dragSelectingEndColumnIndex = null
        this.__dragSelectingEndRowIndex = null
    
        this.setState({
          dragSelecting: false,
          draggingRectBounding: undefined
        })
    }
    
    handleCellMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        if (this.__dragSelecting) {
          this.__dragSelectingEndColumnIndex = event.currentTarget.dataset.colIndex
          this.__dragSelectingEndRowIndex = event.currentTarget.dataset.rowIndex
    
          if (this.__dragSelectingEndColumnIndex !== this.__dragSelectingStartColumnIndex || this.__dragSelectingEndRowIndex !== this.__dragSelectingStartRowIndex) {
            this.__dragSelected = true
            event.preventDefault()
          } else {
            this.__dragSelected = false
          }
    
          this.confirmDragSelecting()
        }
    }

    confirmDragSelecting = () => {
        if (!this.__dragSelectingStartColumnIndex || !this.__dragSelectingStartRowIndex || !this.__dragSelectingEndColumnIndex || !this.__dragSelectingEndRowIndex) {
          return false
        }
        // @ts-ignore
        const { cellKeys: selectedCells, spannedCellBlockKeys } = getCellsInsideRect(
          this.props.editorState, this.tableKey,
          [this.__dragSelectingStartColumnIndex, this.__dragSelectingStartRowIndex],
          [this.__dragSelectingEndColumnIndex, this.__dragSelectingEndRowIndex]
        )
    
        if (selectedCells.length < 2) {
          return false
        }
    
        this.setState({
          selectedColumnIndex: -1,
          selectedRowIndex: -1,
          cellsMergeable: spannedCellBlockKeys.length === 0,
          cellSplittable: false,
          selectedCells: selectedCells
        }, this.renderCells)
    }

    // 调节cell高度
    adjustToolbarHandlers() {
        let needUpdate = false
        const rowToolHandlers: any[] = [...this.state.rowToolHandlers]
    
        Object.keys(this.__rowRefs).forEach((index) => {
            const rowHeight = this.__rowRefs[index] ? this.__rowRefs[index].getBoundingClientRect().height : 40;
            // @ts-ignore
            if (rowToolHandlers[index] && rowToolHandlers[index].height !== rowHeight) {
                needUpdate = true
                // @ts-ignore
                rowToolHandlers[index].height = rowHeight
            }
        })
    
        if (needUpdate) {
          this.setState({ rowToolHandlers })
        }
    }
    
    renderCells(props?: TableRenderProps) {
        props = props || this.props
        this.colLength = 0
    
        const tableRows: React.ReactNode[][] = []
        const colToolHandlers: any[] = []
        const rowToolHandlers: any[] = []
        const { editorState, children } = props
        // @ts-ignore
        const tableWidth = this.__tableRef.current.getBoundingClientRect().width

        if (children && children.length>0) {
            this.__startCellKey = children[0].key;
            this.__endCellKey = children[children.length - 1]!.key;
        
            children.forEach((cell, cellIndex) => {
                if (!cell) return;
                const cellBlock = editorState.getCurrentContent().getBlockForKey(cell.key)
                const cellBlockData = cellBlock.getData()
                const tableKey = cellBlockData.get('tableKey')
                const colIndex = cellBlockData.get('colIndex') * 1
                const rowIndex = cellBlockData.get('rowIndex') * 1
                const colSpan = cellBlockData.get('colSpan')
                const rowSpan = cellBlockData.get('rowSpan')

                this.tableKey = tableKey
                if (rowIndex === 0) {
                    const colgroupData = cellBlockData.get('colgroupData') || []
                    const totalColgroupWidth = colgroupData.reduce((width: number, col: any) => width + col.width * 1, 0)

                    const colSpan = (cellBlockData.get('colSpan') || 1) * 1
                    for (var ii = this.colLength; ii < this.colLength + colSpan; ii++) {

                        colToolHandlers[ii] = {
                            key: cell.key,
                            width:
                                this.state.colToolHandlers[ii] ?
                                this.state.colToolHandlers[ii].width :
                                colgroupData[ii] ? colgroupData[ii].width / totalColgroupWidth * tableWidth * 1 : 0
                        }
                    }
            
                    this.colLength += colSpan
                }

                const newCell = React.cloneElement(cell, {
                    'data-active': !!~this.state.selectedCells.indexOf(cell.key),
                    'data-row-index': rowIndex,
                    'data-col-index': colIndex || (tableRows[rowIndex] || []).length,
                    'data-cell-index': cellIndex,
                    'data-cell-key': cell.key,
                    'data-table-key': tableKey,
                    className: `richEditor-table-cell ${cell.props.className} `,
                    colSpan: colSpan,
                    rowSpan: rowSpan,
                    onClick: this.selectCell,
                    onContextMenu: this.handleCellContexrMenu,
                    onMouseDown: this.handleCellMouseDown,
                    onMouseUp: this.handleCellMouseUp,
                    onMouseEnter: this.handleCellMouseEnter
                })
            
                for (var jj = rowIndex; jj < rowIndex + rowSpan; jj++) {
                    rowToolHandlers[jj] = { key: cell.key, height: 0 }
                    tableRows[jj] = tableRows[jj] || []
                }

                if (!tableRows[rowIndex]) {
                    tableRows[rowIndex] = [newCell]
                } else {
                    tableRows[rowIndex].push(newCell)
                }
            });
        }
        
        // 设置表格的列宽
        const defaultColWidth = tableWidth / this.colLength
        for (let i in colToolHandlers) {
            if (colToolHandlers[i].width==0) {
                colToolHandlers[i].width = defaultColWidth;
            }
        }
        this.setState({ tableRows, colToolHandlers, rowToolHandlers, defaultColWidth }, this.adjustToolbarHandlers)
    }
    ////////////////////////////////////---end cell---/////////////////////////////////////////////////////////


    ////////////////////////////////////---begin table---/////////////////////////////////////////////////////////
    handleTableMouseDown = (event: React.MouseEvent<HTMLTableElement>) => {
        console.log(event.button)
        if (event.button == 2){
            this.showContextMenu = true;
        } else {
            this.showContextMenu = false;
        }  
    };
    hanldeTableMouseUp = (event: React.MouseEvent<HTMLTableElement>) => {
        // event.preventDefault();
    };
    handleTableMouseMove = (event: React.MouseEvent<HTMLTableElement>) => {
        if (this.__dragSelecting && this.__dragSelected) {
            this.updateDraggingRectBounding(event)
            event.preventDefault();
        }
    };
    handleTableMouseLeave = (event: React.MouseEvent<HTMLTableElement>) => {
        if (this.__dragSelecting && event.currentTarget && event.currentTarget.dataset.role === 'table') {
            this.handleCellMouseUp()
        }
        event.preventDefault()
    };

    updateDraggingRectBounding = (mouseEvent: React.MouseEvent<HTMLTableElement>) => {
        if (this.__draggingRectBoundingUpdating || !this.__dragSelecting) {
          return false
        }
    
        this.__draggingRectBoundingUpdating = true
        // @ts-ignore
        const tableBounding = this.__tableRef.current.getBoundingClientRect()
        const { x: startX, y: startY } = this.__draggingStartPoint
        const { clientX: currentX, clientY: currentY } = mouseEvent
    
        const draggingRectBounding: React.CSSProperties = {}
    
        if (currentX <= startX) {
          draggingRectBounding.right = tableBounding.left + tableBounding.width - startX
        } else {
          draggingRectBounding.left = startX - tableBounding.left + 9
        }
    
        if (currentY <= startY) {
          draggingRectBounding.bottom = tableBounding.top + tableBounding.height - startY
        } else {
          draggingRectBounding.top = startY - tableBounding.top + 9
        }
    
        draggingRectBounding.width = Math.abs(currentX - startX)
        draggingRectBounding.height = Math.abs(currentY - startY)
    
        this.setState({ draggingRectBounding }, () => {
          setTimeout(() => {
            this.__draggingRectBoundingUpdating = false
          }, 100)
        })
    }
    
    ////////////////////////////////////---end table---/////////////////////////////////////////////////////////


    createColGroup = () => {
        return (
            <colgroup>
                {this.state.colToolHandlers.map((item, index) => (
                    <col ref={ref => this.__colRefs[index] = ref} width={item.width || this.state.defaultColWidth} key={index}></col>
                ))}
            </colgroup>
        );
    };


    ////////////////////////////////////---begin createContextMenu---/////////////////////////////////////////////////////////
    handleContextMenuContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
    }
    mergeCells = () => {
        const { selectedCells, cellsMergeable } = this.state

        if (cellsMergeable && selectedCells.length > 1) {
            this.setState({
                selectedCells: [selectedCells[0]],
                cellSplittable: true,
                cellsMergeable: false,
                selectedRowIndex: -1,
                selectedColumnIndex: -1,
            }, () => {
                this.props.onChange(mergeCells(this.props.editorState, this.tableKey, selectedCells))
            })
        }
        this.showContextMenu = false;
    };
    splitCell = () => {
        const { selectedCells, cellSplittable } = this.state
        if (cellSplittable && selectedCells.length === 1) {
            this.setState({
                cellSplittable: false,
                cellsMergeable: false,
                selectedRowIndex: -1,
                selectedColumnIndex: -1,
            }, () => {
                this.props.onChange(splitCell(this.props.editorState, this.tableKey, selectedCells[0]))
            })
        }
        this.showContextMenu = false;
    };
    removeTable = () => {
        this.props.onChange(removeTable(this.props.editorState, this.tableKey))
    };
    changeCellBg = (event: React.MouseEvent<HTMLDivElement>) => {
        let extraData: any = [];
        for (let row in this.__rowRefs) {
            let nodes = this.__rowRefs[row].childNodes
            let keys = this.state.selectedCells
            nodes.forEach((node: any) => {
                if (keys.includes(node.getAttribute('data-cell-key'))) {
                    extraData.push({rowIndex: node.getAttribute('data-row-index'), colIndex: node.getAttribute('data-col-index')});
                    let cls = node.getAttribute('class');
                    node.setAttribute("class", cls+" richEditor-table-cell-bg");
                }
            })
        }
        this.showContextMenu = false;
        this.props.onChange(updateCellBg(this.props.editorState, this.tableKey, extraData))
    };
    createContextMenu = () => {
        const { cellsMergeable, cellSplittable, contextMenuPosition } = this.state;
        if (!contextMenuPosition) {
            return null
        }
        return (
            <div className="richEditor-table-context-menu" onContextMenu={this.handleContextMenuContextMenu} contentEditable={false} style={contextMenuPosition}>
                <div className="context-menu-item" onMouseDown={this.mergeCells} data-disabled={!cellsMergeable}>合并单元格</div>
                <div className="context-menu-item" onMouseDown={this.splitCell} data-disabled={!cellSplittable}>拆分单元格</div>
                <div className="context-menu-item" onMouseDown={this.changeCellBg}>填充背景色</div>
                <div className="context-menu-item" onMouseDown={this.removeTable}>删除表格</div>
            </div>
        );
    };
////////////////////////////////////---end createContextMenu---/////////////////////////////////////////////////////////

////////////////////////////////////---begin createColTools---/////////////////////////////////////////////////////////
    getIndexFromEvent = (event: any, ignoredTarget = '') => {
        if (!isNaN(event)) {
            return event * 1
        } else if (ignoredTarget && event && event.target && event.target.dataset.role === ignoredTarget) {
            return false
        } else if (event && event.currentTarget && event.currentTarget.dataset.index) {
            return event.currentTarget.dataset.index * 1
        }
        return false
    }

    handleToolbarMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
    };
    selectColumn = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const selectedColumnIndex = this.getIndexFromEvent(event, 'insert-column')
    
        if (selectedColumnIndex === false) {
          return false
        }
    
        if (this.state.selectedColumnIndex === selectedColumnIndex) {
    
          this.setState({
            selectedCells: [],
            cellsMergeable: false,
            cellSplittable: false,
            selectedColumnIndex: -1
          }, this.renderCells)
          return false
    
        }
        // @ts-ignore
        const { cellKeys: selectedCells, spannedCellBlockKeys } = getCellsInsideRect(
          this.props.editorState, this.tableKey,
          [selectedColumnIndex, 0],
          [selectedColumnIndex, this.state.rowToolHandlers.length - 1]
        )
    
        this.setState({
          selectedColumnIndex: selectedColumnIndex,
          selectedRowIndex: -1,
          cellSplittable: false,
          cellsMergeable: spannedCellBlockKeys.length === 0,
          selectedCells: selectedCells
        }, this.renderCells)
    };

    handleColResizerMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        this.__colResizeIndex = Number(event.currentTarget.dataset.index) * 1
        this.__colResizeStartAt = event.clientX
        this.setState({ colResizing: true })
    }

    handleColResizerMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        if (this.state.colResizing) {

        }
        let colToolHandlers = this.state.colToolHandlers;
        let offSet = this.state.colResizeOffset;
        let add1 = Number(colToolHandlers[this.__colResizeIndex-1].width) + offSet;
        let add2 = Number(colToolHandlers[this.__colResizeIndex].width) - offSet;

        if (add1<0 || add2<0) {
            
        } else {
            colToolHandlers[this.__colResizeIndex-1].width = add1;
            colToolHandlers[this.__colResizeIndex].width = add2;
        }

        this.__colResizeIndex = 0
        this.__colResizeStartAt = 0
        
        this.setState({ 
            contextMenuPosition: null,
            colResizeOffset: 0,
            colResizing: false, 
            colToolHandlers 
        }, () => {
            let blockData = { colgroupData: colToolHandlers.map(item => ({ width: item.width })) }
            this.props.onChange(updateAllTableBlocks(this.props.editorState, this.tableKey, blockData))
        })

    }

    insertColumn = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const columnIndex = this.getIndexFromEvent(event)
    
        if (columnIndex === false) {
          return false
        }
    
        const nextColToolHandlers = this.state.colToolHandlers.map(item => ({ ...item, width: 0 }))
        this.setState({
          selectedCells: [],
          selectedRowIndex: -1,
          selectedColumnIndex: -1,
          colToolHandlers: nextColToolHandlers
        }, () => {
          this.props.onChange(insertColumn(this.props.editorState, this.tableKey, this.state.tableRows.length, columnIndex))
        })
    }

    removeColumn = () => {
        const { selectedColumnIndex } = this.state
        const nextColToolHandlers = this.state.colToolHandlers.map(item => ({ ...item, width: 0 }))
    
        if (selectedColumnIndex >= 0) {
    
          this.setState({
            selectedColumnIndex: -1,
            colToolHandlers: nextColToolHandlers
          }, () => {
            this.props.requestBlur && this.props.requestBlur()
            setImmediate(() => {
              const result = removeColumn(this.props.editorState, this.tableKey, selectedColumnIndex)
              this.props.onChange(this.validateContent(result))
            })
          })
    
        }
    }

    // 校验一下删除行、列之后的内容还有没有，没有的话则创建一个空的editorState，防止后续取不到值报错
    validateContent = (editorState: EditorState) => {
        // @ts-ignore
        const len = toRAW(editorState, true).blocks.length
        return len ? editorState : createEditorState(null)
    }

    createColTools = () => {
        const { colResizing, colResizeOffset, colToolHandlers, selectedColumnIndex, defaultColWidth } = this.state;
        return (
            <div
                data-active={selectedColumnIndex >= 0}
                contentEditable={false}
                data-key="richEditor-col-toolbar"
                className={`richEditor-table-col-tools${colResizing ? ' resizing' : ''}`}
                onMouseDown={this.handleToolbarMouseDown}
            >
                {colToolHandlers.map((item, index) => (
                <div
                    key={index}
                    data-key={item.key}
                    data-index={index}
                    data-active={selectedColumnIndex == index}
                    className="richEditor-col-tool-handler"
                    style={{ width: item.width || defaultColWidth }}
                    onClick={this.selectColumn}
                >
                    {this.props.columnResizable && index !== 0 ? (
                    <div
                        data-index={index}
                        data-key={item.key}
                        className={`richEditor-col-resizer${colResizing && this.__colResizeIndex === index ? ' active' : ''}`}
                        style={colResizing && this.__colResizeIndex === index ? { transform: `translateX(${colResizeOffset}px)` } : undefined}
                        onMouseDown={this.handleColResizerMouseDown}
                        onMouseUp={this.handleColResizerMouseUp}
                    ></div>
                    ) : null}
                    <div className="richEditor-col-tool-left">
                        <div
                            data-index={index}
                            data-role="insert-column"
                            className="richEditor-insert-col-before"
                            onClick={this.insertColumn}
                        >
                             <i className="iconfont icon-insert-column-right fs-3 text-black-50"></i>
                        </div>
                    </div>
                    <div className="richEditor-col-tool-center">
                        <div
                            data-index={index}
                            data-role="remove-col"
                            className="richEditor-remove-col"
                            onClick={this.removeColumn}
                        >
                            <i className="iconfont icon-delete1 fs-3 text-black-50"></i>
                        </div>
                    </div>
                    <div className="richEditor-col-tool-right">
                        <div
                            data-index={index + 1}
                            data-role="insert-column"
                            className="richEditor-insert-col-after"
                            onClick={this.insertColumn}
                        >
                            <i className="iconfont icon-insert-column-left fs-3 text-black-50"></i>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        );
    };
////////////////////////////////////---end createColTools---///////////////////////////////////////////////////////////

////////////////////////////////////---begin createRowTools---/////////////////////////////////////////////////////////
    selectRow = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const selectedRowIndex = this.getIndexFromEvent(event, 'insert-row')

        if (selectedRowIndex === false) {
            return false
        }

        if (this.state.selectedRowIndex === selectedRowIndex) {
            this.setState({
                selectedCells: [],
                cellsMergeable: false,
                cellSplittable: false,
                selectedRowIndex: -1
            }, this.renderCells)
            return false
        }
        // @ts-ignore
        const { cellKeys: selectedCells, spannedCellBlockKeys } = getCellsInsideRect(
            this.props.editorState, this.tableKey,
            [0, selectedRowIndex],
            [this.state.colToolHandlers.length, selectedRowIndex]
        )

        this.setState({
            selectedColumnIndex: -1,
            selectedRowIndex: selectedRowIndex,
            cellSplittable: false,
            cellsMergeable: spannedCellBlockKeys.length === 0,
            selectedCells: selectedCells
        }, this.renderCells)
    }
    insertRow = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const rowIndex = this.getIndexFromEvent(event)
        if (rowIndex === false) {
          return false
        }
        this.setState({
          selectedCells: [],
          selectedRowIndex: -1,
          selectedColumnIndex: -1
        }, () => {
          this.props.onChange(insertRow(this.props.editorState, this.tableKey, this.colLength, rowIndex));
        })
    }
    removeRow = () => {
        const { selectedRowIndex } = this.state
    
        if (selectedRowIndex >= 0) {
          this.setState({
            selectedRowIndex: -1
          }, () => {
            this.props.requestBlur && this.props.requestBlur()
            setImmediate(() => {
              const result = removeRow(this.props.editorState, this.tableKey, selectedRowIndex, {})
              this.props.onChange(this.validateContent(result))
            })
          })
        }
    }
    createRowTools = () => {
        const { rowToolHandlers, selectedRowIndex } = this.state;

        return (
            <div
              data-active={selectedRowIndex >= 0}
              contentEditable={false}
              className="richEditor-table-row-tools"
              onMouseDown={this.handleToolbarMouseDown}
            >
              {rowToolHandlers.map((item, index) => (
                typeof item!='undefined' &&
                <div
                  key={index}
                  data-key={item.key}
                  data-index={index}
                  data-active={selectedRowIndex == index}
                  className="richEditor-row-tool-handler"
                  style={{ height: item.height }}
                  onClick={this.selectRow}
                >
                  <div className="bf-row-tool-up">
                    <div
                      data-index={index}
                      data-role="insert-row"
                      className="richEditor-insert-row-before"
                      onClick={this.insertRow}
                    >
                      <i className="iconfont icon-insert-row-bottomSVG fs-3 text-black-50"></i>
                    </div>
                  </div>
                  <div className="richEditor-row-tool-center">
                    <div
                      data-index={index}
                      data-role="remove-row"
                      className="richEditor-remove-row"
                      onClick={this.removeRow}
                    >
                       <i className="iconfont icon-delete1 fs-3 text-black-50"></i>
                    </div>
                  </div>
                  <div className="richEditor-row-tool-down">
                    <div
                      data-index={index + 1}
                      data-role="insert-row"
                      className="richEditor-insert-row-after"
                      onClick={this.insertRow}
                    >
                      <i className="iconfont icon-insert-row-top fs-3 text-black-50"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )
    };
////////////////////////////////////---end createRowTools---///////////////////////////////////////////////////////////


    render() {
        const { tableRows, dragSelecting, draggingRectBounding } = this.state
        const { readOnly } = this.props;
        return (
            <div className="richEditor-table-container">
                <table
                    data-role="table"
                    className={`richEditor-table${dragSelecting ? ' dragging' : ''}`}
                    ref={this.__tableRef}
                    onMouseDown={this.handleTableMouseDown}
                    onMouseUp={this.hanldeTableMouseUp}
                    onMouseMove={this.handleTableMouseMove}
                    onMouseLeave={this.handleTableMouseLeave}
                >
                    {this.createColGroup()}
                    <tbody>
                        {tableRows.map((cells, rowIndex) => (
                            <tr ref={ref => this.__rowRefs[rowIndex] = ref} key={rowIndex}>{cells}</tr>
                        ))}
                    </tbody>

                </table>
                {dragSelecting ? <div className="dragging-rect" style={draggingRectBounding} /> : null}
                {(!readOnly && this.showContextMenu) && this.createContextMenu()}
                {!readOnly && this.createColTools()}
                {!readOnly && this.createRowTools()}
            </div>
        );
    }
}

export default TableRenderer;
