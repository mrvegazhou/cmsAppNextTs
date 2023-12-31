import React, { useMemo, useState, useContext } from 'react';
import { CSSTransitionProps } from 'react-transition-group/CSSTransition';
import OverlayTrigger, { OverlayTriggerProps, OverlayTriggerRef } from '../overlayTrigger';
import { IProps } from '@/interfaces';
import { MenuItem, MenuItemProps, TagType } from './MenuItem';
import { MenuProps, Menu, ThemeContext } from './Menu';
import './style/submenu.css';

export interface SubMenuProps<T extends TagType> extends IProps, MenuItemProps<T> {
    overlayProps?: OverlayTriggerProps;
    collapse?: boolean;
    disabled?: boolean;
    inlineCollapsed?: boolean;
    inlineIndent?: number;
}

function checkedMenuItem(node?: HTMLElement) {
    let isCheck = false;
    if (node) {
        // eslint-disable-next-line
        do {
            if (!node.dataset.menu) {
                isCheck = true;
            }
            if (node.dataset.menu && /^(subitem|divider)$/.test(node.dataset.menu)) {
                isCheck = false;
            }
        } while (!node.dataset.menu && (node = node.parentNode as HTMLElement));
    }
    return isCheck;
}

function IconView({ prefixCls, collapse, isOpen }: { prefixCls?: string; collapse?: boolean; isOpen: boolean }) {
    return useMemo(
        () => (
            <i
                className={[
                    prefixCls ? `${prefixCls} iconfont icon-youjiantou` : null,
                    !collapse && isOpen ? 'w-open' : null,
                    !collapse && !isOpen ? 'w-close' : null,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .trim()}
            />
        ),
        [prefixCls, collapse, isOpen],
    );
}

export const SubMenu = React.forwardRef(function <Tag extends TagType = 'a'>(
    props: SubMenuProps<Tag>,
    ref: React.Ref<HTMLLIElement>,
) {
    const {
        prefixCls = 'w-menu-subitem',
        className,
        disabled,
        overlayProps = {isOpen: Boolean},
        children,
        collapse = false,
        inlineIndent,
        inlineCollapsed,
        ...other
    } = props;
    const overlayTriggerProps = {} as OverlayTriggerProps & CSSTransitionProps;
    const menuProps: MenuProps = {
        bordered: true,
        children,
        inlineIndent,
        className: [prefixCls ? `${prefixCls}-overlay` : null].filter(Boolean).join(' ').trim(),
    };
    const popupRef = React.useRef<OverlayTriggerRef>(null);
    const refNode = React.useRef<HTMLElement | null>();
    const elementSource = React.useRef<EventTarget | null>();
    const [isOpen, setIsOpen] = useState(!!overlayProps.isOpen);
    const { height, setContextHeight, ele } = useContext(ThemeContext);

    React.useEffect(() => {
        if (refNode.current && refNode.current.style && ele === elementSource.current) {
            const currentHeight = Number(refNode.current!.style.height.substr(0, refNode.current!.style.height.length - 2));
            // 设置的高度 < '已有展开的高度',
            if (refNode.current!.getBoundingClientRect().height < currentHeight) {
                refNode.current!.style.height = currentHeight + 'px';
            } else {
                refNode.current!.style.height = currentHeight + height + 'px';
            }
        }
    }, [height, ele]);

    useMemo(() => {
        if (collapse) setIsOpen(false);
    }, [collapse]);

    function onClick(e: React.MouseEvent<HTMLUListElement, MouseEvent>) {
        const target = e.currentTarget;
        const related = (e.relatedTarget || e.nativeEvent.target) as HTMLElement;
        if (target.children.length < 1) return;
        if (checkedMenuItem(related)) {
            if (popupRef.current) {
                popupRef.current!.hide();
            }
        }
    }
    function onEnter(node: HTMLElement) {
        node.style.height = '0px';
        refNode.current = node;
        setIsOpen(true);
        if (popupRef.current && popupRef.current.overlayDom.current) {
            setContextHeight({
                height: popupRef.current.overlayDom.current.getBoundingClientRect().height,
                ele: elementSource.current!,
            });
        }
    }
    function onEntering(node: HTMLElement) {
        node.style.height = `${node.scrollHeight}px`;
    }
    function onEntered(node: HTMLElement) {
        if (popupRef.current && popupRef.current.overlayDom.current) {
            node.style.height = popupRef.current.overlayDom.current.getBoundingClientRect().height + 'px';
        }
    }
    function onExiting(node: HTMLElement) {
        node.style.height = '0px';
        if (popupRef.current && popupRef.current.overlayDom.current) {
            setContextHeight({
                height: -popupRef.current!.overlayDom.current!.getBoundingClientRect().height,
                ele: elementSource.current!,
            });
        }
    }
    function onExit(node: HTMLElement) {
        node.style.height = `${node.scrollHeight}px`;
        setIsOpen(false);
    }

    if (!collapse) {
        delete menuProps.onClick;
        menuProps.bordered = false;
        overlayTriggerProps.className = `${prefixCls}-collapse`;
        overlayTriggerProps.appear = false;
        overlayTriggerProps.isOutside = true;
        overlayTriggerProps.isClickOutside = false;
        overlayTriggerProps.unmountOnExit = false;
        overlayTriggerProps.trigger = 'click';
        overlayTriggerProps.transitionName = `${prefixCls}`;
        overlayTriggerProps.onExit = onExit;
        overlayTriggerProps.onExiting = onExiting;
        overlayTriggerProps.onEnter = onEnter;
        overlayTriggerProps.onEntered = onEntered;
        overlayTriggerProps.onEntering = onEntering;
    } else {
        overlayTriggerProps.className = `${prefixCls}-popup`;
        overlayTriggerProps.trigger = 'hover';
        overlayTriggerProps.usePortal = true;
        menuProps.onClick = onClick;
    }
    
    return (
        <li
            data-menu="subitem"
            ref={ref}
            onClick={(e) => {
                if (collapse) {
                    e.stopPropagation();
                    return;
                }
                elementSource.current = e.target;
            }}
        >
            <OverlayTrigger
                placement="rightTop"
                autoAdjustOverflow
                disabled={disabled}
                isOpen={isOpen}
                usePortal={false}
                isOutside
                {...overlayTriggerProps}
                {...overlayProps}
                ref={popupRef}
                overlay={<Menu {...menuProps} style={!collapse ? { paddingLeft: inlineIndent } : {}} />}
            >
                <MenuItem
                    {...other}
                    ref={null}
                    disabled={disabled}
                    isSubMenuItem
                    addonAfter={<IconView collapse={collapse} prefixCls={prefixCls} isOpen={isOpen} />}
                    className={[
                        prefixCls ? `${prefixCls}-title` : null,
                        !collapse ? `${prefixCls}-collapse-title` : null,
                        className,
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .trim()}
                />
            </OverlayTrigger>
        </li>
    );
});

SubMenu.displayName = 'uiw.SubMenu';