import { useEffect, useRef } from 'react';

const useClickOutside = (callback: () => void) => {
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            console.log(ref.current , "-c--");
            
            // @ts-ignore
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [callback]);

    return ref;
};

export default useClickOutside;
