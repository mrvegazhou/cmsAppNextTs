import classNames from "classnames";
import styled from "styled-components";

/** className*/
export const itemClassName = classNames([
    "shadow-sm",
    "text-secondary",
    "bg-white",
    "rounded-circle",
    "cursor-pointer",
    "mt-4",
    "text-center",
    "border",
    "border-2",
    "border-secondary-50",
    "opacity-75"
]);

export const iconClassName = classNames([
    "fs-4",
    "iconfont",
]);

export const DivDom = styled.div`
    width:55px;
    height:55px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity:0.7;
`
