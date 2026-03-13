import { generateUploadButton } from '@uploadthing/react';
import type { FileRouter } from 'uploadthing/types';

// Mirror of the API's uploadRouter — kept in sync manually.
// Only the endpoint name matters for type safety on the client.
type UploadRouter = {
  recipeImage: FileRouter[string];
};

// Point UploadThing at our own Fastify API
const UploadButton = generateUploadButton<UploadRouter>({
  url: `${(import.meta.env['VITE_API_URL'] as string | undefined) ?? ''}/api/uploadthing`,
});

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border">
          <img
            src={value}
            alt="Recipe"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      )}
      {!value && (
        <UploadButton
          endpoint="recipeImage"
          onClientUploadComplete={(res) => {
            const url = res[0]?.url;
            if (url) onChange(url);
          }}
          onUploadError={(err) => {
            console.error('Upload error:', err);
          }}
          appearance={{
            button:
              'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium',
            allowedContent: 'text-muted-foreground text-xs',
          }}
        />
      )}
    </div>
  );
}
