'use client';

import { galleryConfig } from '@/admin/content/config';
import { ContentEditorPage } from '@/admin/content/editor';

export default function Page() {
  return <ContentEditorPage config={galleryConfig} />;
}
