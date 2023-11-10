import {  
    ReactNode,
    MouseEvent
} from 'react';
import { 
    ContentState
} from 'draft-js';


export interface propsType {
    entityKey: string;
    contentState: ContentState;
    children: ReactNode;
}
const LinkBlock = (props: propsType) => {
  const entity = props.contentState.getEntity(props.entityKey);
  const { src } = entity.getData();

  const viewLink = (event: MouseEvent, link: string) => {
    // When pressing the Ctrl / command key, click to open the url in the link text
    if (event.getModifierState('Control') || event.getModifierState('Meta')) {
      const tempLink = document.createElement('a');
      tempLink.href = link;
      // @ts-ignore
      tempLink.target = event.currentTarget.target;
      tempLink.click();
    }
  };

  return (
    <>
      <a onClick={(event: MouseEvent) => viewLink(event, src)} href={src} style={{color: '#0086b3', textDecoration: 'none', borderBottom: '1px solid'}}>
        {props.children}
      </a>
    </>
  );
}
export default LinkBlock;