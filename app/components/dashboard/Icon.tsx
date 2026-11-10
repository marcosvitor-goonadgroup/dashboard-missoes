// Ícones de traço simples (24×24), no estilo dos ícones do app Missão BB.

export type IconName =
  | "usuarios"
  | "alvo"
  | "estrela"
  | "premio"
  | "berloque"
  | "ticket"
  | "atualizar"
  | "filtro"
  | "relogio"
  | "check"
  | "alerta"
  | "x"
  | "tabela"
  | "grafico"
  | "info"
  | "ampulheta"

const PATHS: Record<IconName, React.ReactNode> = {
  usuarios: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.7.7 2.7 2.4 3 5.2" />
    </>
  ),
  alvo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </>
  ),
  estrela: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  premio: (
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12" />
      <path d="M12 8C10.5 4.5 7 4 7 6.2 7 8 12 8 12 8s5 0 5-1.8C17 4 13.5 4.5 12 8z" />
    </>
  ),
  berloque: (
    <>
      <path d="M12 2.5v3" />
      <circle cx="12" cy="7" r="1.6" />
      <path d="m12 9 6 3.5v5L12 21l-6-3.5v-5z" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8.5V6.8C3 6.4 3.4 6 3.8 6h16.4c.4 0 .8.4.8.8v1.7a2.5 2.5 0 0 0 0 5v1.7c0 .4-.4.8-.8.8H3.8c-.4 0-.8-.4-.8-.8v-1.7a2.5 2.5 0 0 0 0-5z" />
      <path d="M14.5 6v12" strokeDasharray="2 2" />
    </>
  ),
  atualizar: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.8L4 8" />
      <path d="M4 3.5V8h4.5M4 13a8 8 0 0 0 14.3 4.8L20 16" />
      <path d="M20 20.5V16h-4.5" />
    </>
  ),
  filtro: <path d="M3.5 5h17l-6.5 7.8V19l-4 1.5v-7.7z" />,
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alerta: (
    <>
      <path d="M12 3.5 2.8 19.5h18.4z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  tabela: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M3.5 14.5h17M10 9.5v10" />
    </>
  ),
  grafico: (
    <>
      <path d="M4 19.5h16" />
      <path d="M7 16v-4M12 16V7M17 16v-6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.3" />
    </>
  ),
  ampulheta: (
    <>
      <path d="M6.5 3.5h11M6.5 20.5h11" />
      <path d="M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5" />
    </>
  ),
}

export default function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
  title,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  )
}
