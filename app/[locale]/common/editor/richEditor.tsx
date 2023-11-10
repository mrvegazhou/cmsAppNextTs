"use client";
import { forwardRef, useState, useLayoutEffect, useImperativeHandle, useEffect, FC } from "react";
import styled from 'styled-components';
import Editor from "@/components/richEditor/richEditor";

export interface propsType {
    id: string;
}
const RichEditor: FC<propsType> = (props) => {

    useEffect(() => {
        
    });

    return (
        <>
            <Editor id={props.id} content="sssssddd <a href='xxx' style='color:#0086b3;text-decoration:none;border-bottom:1px solid;'>text</a>" />
        </>
    );
};

export default RichEditor;
