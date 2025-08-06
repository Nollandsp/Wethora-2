import "./globals.css";
import Head from "next/head";
import "leaflet/dist/leaflet.css";


export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <Head>
        {/* Google Font: Inter Tight */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body
        className="relative min-h-screen"
        style={{ fontFamily: "'Inter Tight', sans-serif" }}
      >
        {/* ✅ Arrière-plan animé sans image */}
        <div className="background-design fixed inset-0 -z-10"></div>

        {/* ✅ Contenu de la page */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
