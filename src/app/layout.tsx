import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ADIEM | Motorsport Suite V2", description: "Gestão de kart, telemetria, manutenção e custos." };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
