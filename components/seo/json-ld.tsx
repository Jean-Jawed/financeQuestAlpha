/**
 * FINANCEQUEST - COMPONENT: JsonLd
 * Données structurées schema.org, insérées dans la page
 */

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // « < » échappé : le contenu ne peut pas fermer la balise script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
