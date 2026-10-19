'use client';

import { galleryConfig } from '@/admin/content/config';
import { ContentListPage } from '@/admin/content/list';

export default function Page() {
  return <ContentListPage config={galleryConfig} />;
}
