import type { Metadata } from "next";
import { getProjectBySlug } from "@/data/projects";
import projects from "@/data/projects";
import ProjectSlugPage from "./_components/ProjectSlugPage";

const SITE_URL = "https://propinvest-ai-smoky.vercel.app";

// ─── Static params — tells Next.js to pre-render all 55 project pages ─────────
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// ─── Dynamic metadata per project ────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return { title: "Project Not Found", description: "This project could not be found." };
  }

  function fmt(v: number): string {
    if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
    if (v >= 100_000) return `₹${(v / 100_000).toFixed(0)}L`;
    return `₹${v.toLocaleString("en-IN")}`;
  }

  const grossYield = ((project.avgRent * 12) / project.input.property_purchase_price * 100).toFixed(1);
  const priceRange = `${fmt(project.priceMin)}–${fmt(project.priceMax)}`;

  const title = `${project.name} by ${project.developer} — Investment Analysis ${new Date().getFullYear()}`;
  const description = `Is ${project.name} in ${project.locality}, ${project.city} a good investment? Full analysis: IRR, rental yield (${grossYield}%), DSCR, risk score, price range ${priceRange}. Free instant analysis by PropInvest AI.`;

  const canonicalUrl = `${SITE_URL}/projects/${params.slug}`;

  return {
    title,
    description,
    keywords: [
      `${project.name} investment analysis`,
      `${project.developer} ${project.city} investment`,
      `${project.locality} ${project.city} property investment`,
      `${project.name} returns IRR`,
      `${project.developer} property analysis`,
      `${project.city} real estate investment ${new Date().getFullYear()}`,
      `${project.locality} rental yield`,
      `should I buy ${project.name}`,
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Page({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);

  // JSON-LD for each project page
  const jsonLd = project ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${project.name} Investment Analysis — IRR, Returns, Risk`,
    description: `Investment analysis for ${project.name} by ${project.developer} in ${project.locality}, ${project.city}`,
    author: { "@type": "Organization", name: "PropInvest AI" },
    publisher: { "@type": "Organization", name: "PropInvest AI", url: SITE_URL },
    url: `${SITE_URL}/projects/${params.slug}`,
    about: {
      "@type": "RealEstateListing",
      name: project.name,
      address: { "@type": "PostalAddress", addressLocality: project.locality, addressRegion: project.city, addressCountry: "IN" },
      offers: { "@type": "Offer", priceCurrency: "INR", priceSpecification: { "@type": "PriceSpecification", minPrice: project.priceMin, maxPrice: project.priceMax, priceCurrency: "INR" } },
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ProjectSlugPage params={params} />
    </>
  );
}
