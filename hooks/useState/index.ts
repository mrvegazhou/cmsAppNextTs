import { useEffect, useRef, useState } from 'react';
 
/**
 * 自定义 useState
 * @param state
 * @returns
 */
const useSyncState =  <T extends object>(state: T = {} as T): [T, Function] => {
  const cbRef: { current: any } = useRef();
  const [data, setData] = useState<T>(state);
 
  useEffect(() => {
    cbRef.current && cbRef.current(data);
  }, [data]);
  
  const setDataAndCallback = (newValue: T, callback: Function) => {
    cbRef.current = callback;
    setData(prev=>{
      return newValue;
    });
  };

  return [
    data,
    setDataAndCallback
  ];
};
 
export default useSyncState;