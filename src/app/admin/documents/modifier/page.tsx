'use client';

import { documentsConfig } from '@/admin/content/config';
import { ContentEditorPage } from '@/admin/content/editor';

export default function Page() {
  return <ContentEditorPage config={documentsConfig} />;
}
