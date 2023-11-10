import { 
    ContentBlock,
    ContentState,
    CompositeDecorator
} from 'draft-js';
import Immutable from 'immutable';

class MultiDecorator {

    decorators: Immutable.List<CompositeDecorator>
    KEY_SEPARATOR: string

    constructor(decorators: CompositeDecorator[]) {
        this.decorators = Immutable.List(decorators);
        this.KEY_SEPARATOR = '-'
    }

    getDecorations(block: ContentBlock, contentState: ContentState): Immutable.List<string> {
        var decorations = Array(block.getText().length).fill(null);
        var that = this;
        this.decorators.forEach(function(decorator, i) {
            decorator!.getDecorations(block, contentState).forEach((key, offset) => {
                if (!key) {
                  return;
                }
                decorations[offset!] = i + that.KEY_SEPARATOR + key;
            });
        });
        return Immutable.List(decorations);
    };

    getDecoratorForKey(key: string): CompositeDecorator {
        var parts = key.split(this.KEY_SEPARATOR);
        var index = Number(parts[0]);
    
        return this.decorators.get(index);
    };

    getInnerKey(key: string) {
        var parts = key.split(this.KEY_SEPARATOR);
        return parts.slice(1).join(this.KEY_SEPARATOR);
    };

    getComponentForKey(key: string): Function {
        var decorator = this.getDecoratorForKey(key);
        return decorator.getComponentForKey(
            this.getInnerKey(key)
        );
    };

    getPropsForKey(key: string): Object {
        var decorator = this.getDecoratorForKey(key);
        return decorator.getPropsForKey(
            this.getInnerKey(key)
        );
    };
};

export default MultiDecorator;
