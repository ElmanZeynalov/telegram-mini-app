'use client';

import { Sidebar } from '@/components/Sidebar';
import { FlowEditor } from '@/components/FlowEditor';

export default function Home() {
  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      <Sidebar />
      <FlowEditor />
    </div>
  );
}
