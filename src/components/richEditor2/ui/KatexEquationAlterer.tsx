/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslations } from 'next-intl';
import KatexRenderer from './KatexRenderer';

type Props = {
    initialEquation?: string;
    onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({
    onConfirm,
    initialEquation = '',
}: Props): JSX.Element {
    const t = useTranslations('ArticleEditPage');
    const [editor] = useLexicalComposerContext();
    const [equation, setEquation] = useState<string>(initialEquation);
    const [inline, setInline] = useState<boolean>(true);

    const onClick = useCallback(() => {
        onConfirm(equation, inline);
    }, [onConfirm, equation, inline]);

    const onCheckboxChange = useCallback(() => {
        setInline(!inline);
    }, [setInline, inline]);

    return (
        <form>
            <div className="mb-3">
                <input id="inline" type="checkbox" className='form-check-input me-2' checked={inline} onChange={onCheckboxChange} />
                <label htmlFor="inline" className="form-check-label">{t('inline')}</label>
            </div>
            <div className="mb-3">
                <label htmlFor="Equation" className="form-label">{t('equation')}</label>
                {inline ? (
                    <input
                        onChange={(event) => {
                            setEquation(event.target.value);
                        }}
                        value={equation}
                        id="Equation"
                        className='form-control'
                    />
                ) : (
                    <textarea
                        onChange={(event) => {
                            setEquation(event.target.value);
                        }}
                        value={equation}
                        id="Equation"
                        className='form-control'
                    />
                )}
            </div>
            <div className="mb-3">
                <label className="form-label">{t('visualization')}</label>
                <ErrorBoundary onError={(e) => editor._onError(e)} fallback={null}>
                    <KatexRenderer
                        equation={equation}
                        inline={false}
                        onDoubleClick={() => null}
                    />
                </ErrorBoundary>
            </div>
            <div className="text-center">
                <button className="btn btn-primary" type="button" onClick={onClick}>{t('confirm')}</button>
            </div>
        </form>
    );
}
