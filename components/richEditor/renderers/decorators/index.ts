import { CompositeDecorator, ContentBlock, ContentState } from 'draft-js';
import MultiDecorator from '../../utils/multidecorators';
import LinkBlock from './link';
import { PrismDe } from '../../components/codeHighLighter';

const builtinDecorators = [
    {
      type: 'entity',
      decorator: {
        key: 'LINK',
        component: LinkBlock,
      },
    },
];

const Decorators = () => {
    const entityDecorators = [
        ...builtinDecorators,
    ];

    const createStrategy = (type: string) => (block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) => {
        // 为该ContentBlock中每个连续范围的实体执行一个回调
        block.findEntityRanges((character) => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null && contentState.getEntity(entityKey).getType() === type
          );
        }, callback);
    };
    
    return new MultiDecorator([
        new CompositeDecorator(
            entityDecorators.map((item) => ({
              strategy: createStrategy(item.decorator.key),
              component: item.decorator.component,
            })),
        ),
        PrismDe
    ]);
};

export default Decorators;

