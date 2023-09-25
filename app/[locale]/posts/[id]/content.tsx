'use client';

import Image from 'next/image';
import Link from 'next/link';
import classNames from 'classnames';
import { getUserAvatar } from '@/lib/tool';
import type { IPostClientDetails } from '@/interfaces';
import type { TMetadata } from '@/types';
// import ButtonAreaPostIdPage from '@/app/[locale]/posts/[id]/buttonArea';
import Outline from '@/app/[locale]/posts/[id]/edit/outline';
import { useTranslations } from 'use-intl';
import ContentHtml from '@/app/[locale]/common/content/html';

