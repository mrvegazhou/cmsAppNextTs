import {
  createContext,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import type { TMetadata, TPostContentType, TPostOtherStates } from '@/types';
import type { IDifference } from '@/interfaces';

export type TEditPostForm = {
  cover: string;
  customTags: string[];
  name: string;
  otherStates: TPostOtherStates[];
  overview: string;
  contentType: TPostContentType;
  contentLink: string;
  secret: string;
  sectionId: string;
  statement: string;
  uploadCover: string;
  uploadCoverFile: string;
  uploadCoverObjectUrl: string;
  allow?: string[];
  block?: string[];
};

export type TEditPostConfig = {
  isCenterEditor?: boolean;
};

export const EditPostContext = createContext<
  | {
      tab: number;
      form: TEditPostForm;
      config: TEditPostConfig;
      isSave: boolean;
      isLoadPreview: boolean;
      setTab: Dispatch<SetStateAction<number>>;
      setForm: Dispatch<SetStateAction<TEditPostForm>>;
      setConfig: Dispatch<SetStateAction<TEditPostConfig>>;
      setIsSave: Dispatch<SetStateAction<boolean>>;
      setIsLoadPreview: Dispatch<SetStateAction<boolean>>;
      differenceData: IDifference[];
      onClickSave: () => void;
      onClickPreview: () => void;
      editorRef: MutableRefObject<
        | {
            getEditorContent: () => string;
            setEditorContent: (value: any) => void;
          }
        | undefined
      >;
      metadata?: TMetadata;
      isSaving: boolean;
      setIsSaving: Dispatch<SetStateAction<boolean>>;
    }
  | undefined
>(undefined);
