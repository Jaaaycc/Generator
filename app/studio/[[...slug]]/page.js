// app/studio/[[...slug]]/page.js
import StudioShell from '@/components/StandaloneShell';
import AvatarManager from '@/components/AvatarManager'; // <-- Add this line

export default function StudioPage() {
  return (
    <>
      <StudioShell />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AvatarManager /> {/* <-- Add this line */}
      </div>
    </>
  );
}