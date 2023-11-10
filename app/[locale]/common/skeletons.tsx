'use client';

import { FC, useState } from "react";

interface propsType {
    count: number;
}

const Skeleton: FC<propsType> = props => {
    const [state, setState] = useState(Array(props.count).fill(1));
    return (
        <>
        <style jsx>{`
            .skeletons {
                position: relative;
                display: block;
                overflow: hidden;
                width: 100%;
                min-height: 20px;
                background-color: #ededed;
            }
            .skeletons:empty::after {
                display: block;
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                transform: translateX(-100%);
                background: linear-gradient(90deg, transparent, rgba(216, 216, 216, 0.253), transparent);
                animation: loading 1.5s infinite;
            }
            @keyframes loading { /* 骨架屏动画 */
                from {
                  left: -100%;
                }
                to {
                  left: 120%;
                }
            }
        `}</style>
            {state.map(item => (
                <div key={item}>
                    <div className={'skeletons'}></div>
                </div>
            ))}
        </>
    )
}
export default Skeleton;