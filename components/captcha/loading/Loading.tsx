import type { FC } from 'react';
import React from 'react';
import type { LoadingProps } from './PropsType';
import { createNamespace } from '../utils';
import './style/index.scss';
import classNames from 'classnames';
import Icon from '../icon';

const [bem] = createNamespace('loading');

const Loading: FC<LoadingProps> = (props) => {
  const { className } = props;
  return (
    <div className={classNames(className, bem())}>
      <Icon name='loading' size={38} spin/>
    </div>
  );
};

export default Loading;
