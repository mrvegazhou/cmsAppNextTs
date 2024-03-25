
interface CatalogProps {
    linkClass: string;
    linkActiveClass: string;
    supplyTop: number;
    selector: string[];
    active: Function | null;
    contentEl: string | HTMLElement;
    catelogEl: string | HTMLElement;
}
interface TreeItem {
    name: string;
    tagName: string;
    id: string | number;
    level: string | number;
    parent: TreeItem;
}

class CreateCatalog {
    contentEl: any;
    option: CatalogProps;
    $catelog: HTMLElement;
    $content: HTMLElement|null;
    // 点击跳转不触发scroll事件
    clickToScroll = false; 
    allCatelogs: any;

    constructor(opts: CatalogProps) {
        let defaultOpts = {
            linkClass: 'cms-catelog-link',
            linkActiveClass: 'cms-catelog-link-active',
            supplyTop: 0,
            selector: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            active: null    // 激活时候回调
        };
        let option = Object.assign({}, defaultOpts, opts);
        // 内容元素
        let $content: HTMLElement|null = this.contentEl = option.contentEl instanceof HTMLElement ? option.contentEl : document.getElementById(option.contentEl);

        // 目录元素
        const $catelog = option.catelogEl instanceof HTMLElement ? option.catelogEl : document.getElementById(option.catelogEl);
       
        let allCatelogs = $content!.querySelectorAll(option.selector.join());
        let tree = this.getCatelogsTree(allCatelogs);
        this.option = option;
        // 点击跳转不触发scroll事件
        let clickToScroll = false;
        // @ts-ignore
        $catelog.innerHTML = this.generateHtmlTree(tree, { id: -1 });
        $catelog!.setAttribute("class", "cms-catelog-list");

        this.$catelog = $catelog!;
        this.$content = $content;
        
        let that = this;
        // @ts-ignore
        this.addEvent($catelog, 'click', function (e) {
            const target = e.target || e.srcElement;
            const id = target.getAttribute('data-target');
            if (id) {
              let headEl = document.getElementById(id);
              clickToScroll = true;
              const eleTop = that.getElementTop(headEl!);
              if (eleTop) {
                window.scrollTo(0, eleTop - option.supplyTop);
                that.setActiveItem(id);
              }
            }
        });

        this.addEvent(window, 'scroll', () => {
            // 鼠标滚动则触发，点击滚动不触发
            if (!that.clickToScroll) {
                let scrollTop = that.getScrollTop() + that.option.supplyTop;
                let scrollToEl = null;
                for (let i = that.allCatelogs.length - 1; i >= 0; i--) {
                    let eleTop = that.getElementTop(that.allCatelogs[i]);
                    if (eleTop==null) return;
                    if ( eleTop <= scrollTop) {
                        scrollToEl = that.allCatelogs[i];
                        break;
                    }
                }
                if (scrollToEl) that.setActiveItem(scrollToEl.id);
                else that.setActiveItem(null);   // 无匹配的元素
            }
            that.clickToScroll = false;
        });

        this.allCatelogs = $content!.querySelectorAll(option.selector.join());
    }


    /**
     * 获取目录树
     * @param catelogs
     */
    getCatelogsTree(catelogs: NodeListOf<Element>): TreeItem[] {
        let title, tagName, tree: any[] = [], treeItem: TreeItem, parentItem = { id: -1 }, lastTreeItem = null;
        let id;
        for (let i = 0; i < catelogs.length; i++) {
            // @ts-ignore
            title = catelogs[i].innerText || catelogs[i].textContent;
            tagName = catelogs[i].tagName;
            id = 'heading-' + i;
            catelogs[i].id = id;
            treeItem = {
                name: title!,
                tagName: tagName,
                id: id,
                level: this.getLevel(tagName),
                // @ts-ignore
                parent: parentItem
            };

            if (lastTreeItem) {
                if (this.getPriority(treeItem.tagName) < this.getPriority(lastTreeItem.tagName)) {
                  treeItem.parent = lastTreeItem;
                } else {
                  treeItem.parent = this.findParent(treeItem, lastTreeItem);
                }
            }
            lastTreeItem = treeItem;
            tree.push(treeItem);
        }

        return tree;
    }

    /**
     *  获取等级
     * @param tagName
     * @returns {*}
     */
    getLevel(tagName: string) {
        return tagName ? tagName.slice(1) : 0;
    }

    /**
     *  获取权重
     */
    getPriority(tagName: string) {
        let priority = 0;
        if (tagName) {
            switch (tagName.toLowerCase()) {
              case 'h1':
                priority = 6;
                break;
              case 'h2':
                priority = 5;
                break;
              case 'h3':
                priority = 4;
                break;
              case 'h4':
                priority = 3;
                break;
              case 'h5':
                priority = 2;
                break;
              case 'h6':
                priority = 1;
                break;
            }
        }
        return priority;
    }

    /**
     * 找到当前节点的父级
     * @param currTreeItem
     * @param lastTreeItem
     * @returns {*|Window}
     */
    findParent(currTreeItem: TreeItem, lastTreeItem: TreeItem) {
        let lastTreeParent = lastTreeItem.parent;
        while (lastTreeParent && (this.getPriority(currTreeItem.tagName) >= this.getPriority(lastTreeParent.tagName))) {
            lastTreeParent = lastTreeParent.parent;
        }
        return lastTreeParent || { id: -1 };
    }

    /**
     * 生成树
     * @param tree
     */
    generateHtmlTree(tree: TreeItem[], _parent: TreeItem) {
        let ul, hasChild = false;
        if (tree) {
            ul = '<ul>';
            for (let i = 0; i < tree.length; i++) {
                if (this.isEqual(tree[i].parent, _parent)) {
                    hasChild = true;
                    ul += `<li><div class="${this.option.linkClass} cms-catelog-level-${tree[i].level}" data-target="${tree[i].id}">` + tree[i].name + '</div>';
                    ul += this.generateHtmlTree(tree, tree[i]);
                    ul += '</li>';
                }
            }
            ul += '</ul>'
        }
        return hasChild ? ul : '';
    }

    isEqual(node: TreeItem, node2: TreeItem) {
        return node && node2 && typeof node === 'object' && typeof node2 === 'object' && node.id === node2.id
    }


    /**
   * 绑定事件
   * @param obj
   * @param type
   * @param fn
   */
    addEvent(obj: any, type: string, fn: Function) {
        if (obj) {
            if (obj.attachEvent) {
                obj['e' + type + fn] = fn;
                obj[type + fn] = function () {
                    obj['e' + type + fn](window.event);
                };
                obj.attachEvent('on' + type, obj[type + fn]);
            } else {
                obj.addEventListener(type, fn, false);
            }
        }
    };

    /**
     * 获取元素距离顶部的距离
     * @param {*} el 
     */
    getElementTop(el: HTMLElement, by: any = null) {
        if (el==null) return null;

        let top = el.offsetTop;
        // @ts-ignore
        while (el = el.offsetParent) {
            if (by === el) {
                break
            }
            top += el.offsetTop;
        }
        return top;
    }

    /**
     *  设置选中的项
     */
    setActiveItem(id: any) {
        let catelogs = this.$catelog.querySelectorAll('[data-target]');
        // @ts-ignore
        catelogs = Array.prototype.slice.call(catelogs);
        let activeTarget = null, c;

        for (let i = 0; i < catelogs.length; i++) {
            c = catelogs[i];
            if (this.getDataset(c, 'target') === id) {

                this.addClass(c, this.option.linkActiveClass)

                activeTarget = c;

                const top = this.getElementTop(c as HTMLElement, this.$catelog)
                if (top==null) return;
                this.$catelog.scrollTop = top - this.$catelog.offsetHeight / 2
                // c.scrollIntoView({
                //   behavior: 'smooth'
                // })

            } else {
                this.removeClass(c, this.option.linkActiveClass)
            }
        }
        if (typeof this.option.active === 'function') {
            this.option.active.call(this, activeTarget);
        }
    }

    /**
     * 获取dataset属性
     * @param el
     * @param id
     * @returns {*}
     */
    getDataset(el: any, id: any) {
        if (el.dataset) {
            return el.dataset[id];
        } else {
            return el.getAttribute(`data-${id}`)
        }
    }

    /**
     *  添加样式
     * @param node  节点
     * @param className 样式名
     */
    addClass(node: any, className: string) {
        if (!this.hasClass(node, className)) node.className += " " + className;
    };

    /**
     *  移除样式
     * @param node  节点
     * @param className 将移除的样式
     */
    removeClass(node: any, className: string) {
        if (this.hasClass(node, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        node.className = node.className.replace(reg, ' ');
        }
    };

    /**
     * 判断是否有class
     * @param node  节点
     * @param className 样式名
     * @returns {*}
     */
    hasClass(node: any, className: string) {
        if (node.className) {
        return node.className.match(
            new RegExp('(\\s|^)' + className + '(\\s|$)'));
        } else {
        return false;
        }
    };

    /**
     * 滚动处理事件
     * @param e
     */
    resolveScroll(e: any) {

        
    }

    /**
     * 获取滚动条滚动的高度
     * @returns {number}
     */
    getScrollTop() {
        return document.documentElement.scrollTop || document.body.scrollTop;
    }


    // 重新构建目录
    rebuild() {
        this.allCatelogs = this.$content!.querySelectorAll(this.option.selector.join());
        let tree = this.getCatelogsTree(this.allCatelogs);
        // @ts-ignore
        this.$catelog.innerHTML = this.generateHtmlTree(tree, { id: -1 });
    }
}

export default CreateCatalog;