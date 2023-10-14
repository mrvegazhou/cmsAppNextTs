export interface BordersSize extends CSSStyleDeclaration {
    [key: string]: any;
}
export default function getBordersSize(styles: BordersSize, axis: 'x' | 'y'): number {
    const sideA: string = axis === 'x' ? 'Left' : 'Top';
    const sideB: string = sideA === 'Left' ? 'Right' : 'Bottom';
    return parseFloat(styles[`border${sideA}Width`]) + parseFloat(styles[`border${sideB}Width`]);
}