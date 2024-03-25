
// 标注的评论
export type IArticleNoteComment = {
    author: string;
    content: string;
    deleted: boolean;
    id: string;
    timeStamp: number;
    type: 'comment';
};
  
// 标注信息
export type IArticleNote = {
    comments: Array<IArticleNoteComment>;
    id: string;
    quote: string;
    type: 'thread';
};