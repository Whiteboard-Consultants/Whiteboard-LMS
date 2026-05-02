interface JsonLdSchemaProps {
  schema: any;
}

export function JsonLdSchema({ schema }: JsonLdSchemaProps) {
  if (typeof window === 'undefined') {
    // Server-side rendering - return the script as a string
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }
  
  // Client-side - don't render anything
  return null;
}
