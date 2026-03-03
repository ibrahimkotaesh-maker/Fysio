import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://vindfysio.nl'),
  title: {
    default: "VindFysio — Vind jouw fysiotherapeut in Nederland",
    template: "%s | VindFysio",
  },
  description: "Zoek en vergelijk fysiotherapeuten bij jou in de buurt. 4.200+ praktijken in 280+ steden door heel Nederland.",
  keywords: "fysiotherapeut, fysiotherapie, fysiotherapeut zoeken, fysiotherapeut bij mij in de buurt, behandeling, Nederland",
  authors: [{ name: 'VindFysio' }],
  verification: {
    google: 'nGR-SoZL7j9DAAKHGrbwnOq0_H4-D5eO1zFES719mkQ',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "VindFysio — Vind jouw fysiotherapeut",
    description: "Zoek en vergelijk fysiotherapeuten bij jou in de buurt. 4.200+ praktijken in heel Nederland.",
    url: 'https://vindfysio.nl',
    siteName: 'VindFysio',
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VindFysio — Vind jouw fysiotherapeut',
    description: 'Zoek en vergelijk fysiotherapeuten bij jou in de buurt.',
  },
};

function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VindFysio',
    url: 'https://vindfysio.nl',
    description: 'Zoek en vergelijk fysiotherapeuten bij jou in de buurt in heel Nederland.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vindfysio.nl/zoeken?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <WebsiteJsonLd />
      </head>
      <body>{children}</body>
    </html>
  );
}

