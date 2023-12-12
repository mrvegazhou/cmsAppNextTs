import { EditorState } from 'draft-js';
import React, {
    Fragment,
    ComponentType,
    CSSProperties,
    FC,
    useEffect,
    useRef,
    useState,
} from 'react';


export interface ToolbarChildrenProps {
    editorState: EditorState;
    onChange: Function;
    onOverrideContent: (
      content: ComponentType<ToolbarChildrenProps> | undefined
    ) => void;
}
interface ToolbarProps {
    editorState: EditorState;
    editorRef?: HTMLElement;
    children?: FC<ToolbarChildrenProps>;
    isVisible?: boolean;
    position?: { top: number; left: number };
    overrideContent?: ComponentType<ToolbarChildrenProps>;
    
}
export const Toolbar: FC<ToolbarProps> = ({
    editorState: defaultStore,
    children,
    isVisible: defaultIsVisible,
    position: defaultPosition,
    overrideContent: defaultOverrideContent,
}: ToolbarProps) => {

    const [toolbarPropsState, setToolbarPropsState] = useState<ToolbarProps>({
        editorState: defaultStore,
        isVisible: defaultIsVisible,
        position: defaultPosition,
        overrideContent: defaultOverrideContent,
    });

    
}

