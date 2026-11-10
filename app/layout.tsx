import type React from "react"
import localFont from "next/font/local";
import type { Metadata, Viewport } from "next"
import "./globals.css"

// Fonte para Títulos
const bancoDoBrasilTitulos = localFont({
  src: [
    {
      path: './fonts/BancoDoBrasilTitulos-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/BancoDoBrasilTitulos-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/BancoDoBrasilTitulos-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/BancoDoBrasilTitulos-BoldIt.ttf',
      weight: '700',
      style: 'italic',
    },
    {
        path: './fonts/BancoDoBrasilTitulos-Light.ttf',
        weight: '300',
        style: 'normal',
    },
    {
        path: './fonts/BancoDoBrasilTitulos-LightIt.ttf',
        weight: '300',
        style: 'italic',
    },
    {
        path: './fonts/BancoDoBrasilTitulos-Medium.ttf',
        weight: '500',
        style: 'normal',
    },
    {
        path: './fonts/BancoDoBrasilTitulos-MediumIt.ttf',
        weight: '500',
        style: 'italic',
    },
    {
        path: './fonts/BancoDoBrasilTitulos-XBold.ttf',
        weight: '800',
        style: 'normal',
    },
    {
        path: './fonts/BancoDoBrasilTitulos-XBoldIt.ttf',
        weight: '800',
        style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-banco-titulos', // Variável CSS para os títulos
});

// Fonte para Textos
const bancoDoBrasilTextos = localFont({
    src: [
      {
        path: './fonts/BancoDoBrasilTextos-Regular.ttf',
        weight: '400',
        style: 'normal',
      },
      {
        path: './fonts/BancoDoBrasilTextos-Italic.ttf',
        weight: '400',
        style: 'italic',
      },
      {
        path: './fonts/BancoDoBrasilTextos-Bold.ttf',
        weight: '700',
        style: 'normal',
      },
      {
        path: './fonts/BancoDoBrasilTextos-BoldIt.ttf',
        weight: '700',
        style: 'italic',
      },
      {
        path: './fonts/BancoDoBrasilTextos-Light.ttf',
        weight: '300',
        style: 'normal',
      },
      {
        path: './fonts/BancoDoBrasilTextos-LightIt.ttf',
        weight: '300',
        style: 'italic',
      },
      {
        path: './fonts/BancoDoBrasilTextos-Medium.ttf',
        weight: '500',
        style: 'normal',
      },
      {
        path: './fonts/BancoDoBrasilTextos-MediumIt.ttf',
        weight: '500',
        style: 'italic',
      },
      {
        path: './fonts/BancoDoBrasilTextos-XBold.ttf',
        weight: '800',
        style: 'normal',
      },
      {
        path: './fonts/BancoDoBrasilTextos-XBoldIt.ttf',
        weight: '800',
        style: 'italic',
      },
    ],
    display: 'swap',
    variable: '--font-banco-textos', // Variável CSS para os textos
  });

export const metadata: Metadata = {
  title: "Missão BB · Dashboard",
  description: "Painel de resultados da Missão BB no Rec’n’Play 2026",
  icons: { icon: "/favicon.ico" },
}

export const viewport: Viewport = {
  themeColor: "#FCFC30",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${bancoDoBrasilTitulos.variable} ${bancoDoBrasilTextos.variable}`}>
      <body>{children}</body>
    </html>
  )
}
