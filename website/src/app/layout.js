import "./globals.css";

export const metadata = {
  title: "FysioVind — Vind jouw fysiotherapeut in Nederland",
  description: "Zoek en vergelijk fysiotherapeuten bij jou in de buurt. 4.200+ praktijken in 280+ steden door heel Nederland.",
  keywords: "fysiotherapeut, fysiotherapie, fysiotherapeut zoeken, behandeling, Nederland",
  openGraph: {
    title: "FysioVind — Vind jouw fysiotherapeut",
    description: "Zoek en vergelijk fysiotherapeuten bij jou in de buurt.",
    locale: "nl_NL",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
