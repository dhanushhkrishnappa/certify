/**
 * Curated Minimal Monochrome Avatars (SVG Data URIs)
 * Deterministic and zero-network: Guaranteed never to 404 or show broken images on any hosting platform.
 */
export interface AvatarItem {
  id: string;
  name: string;
  description: string;
  src: string;
}

export const PRESET_AVATARS: AvatarItem[] = [
  {
    id: "wolf",
    name: "Wolf",
    description: "Focus & Intuition",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M26%2068L36%2048L32%2030L44%2038L52%2026L58%2040L72%2052L62%2058L68%2070L54%2064L44%2072L36%2062L26%2068Z%22%20fill%3D%22%2318181B%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M36%2048L52%2046L58%2040%22%20stroke%3D%22%23E4E4E7%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M52%2046L62%2058L54%2064L52%2046Z%22%20fill%3D%22%2327272A%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2242%22%20cy%3D%2244%22%20r%3D%222%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M44%2038L52%2046%22%20stroke%3D%22%23A1A1AA%22%20stroke-width%3D%221.2%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M44%2072L54%2064%22%20stroke%3D%22%23A1A1AA%22%20stroke-width%3D%221.2%22%2F%3E%0A%3C%2Fsvg%3E",
  },
  {
    id: "owl",
    name: "Owl",
    description: "Socratic Wisdom",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2237%22%20cy%3D%2244%22%20r%3D%2214%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20fill%3D%22%2318181B%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2263%22%20cy%3D%2244%22%20r%3D%2214%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20fill%3D%22%2318181B%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2237%22%20cy%3D%2244%22%20r%3D%225%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2263%22%20cy%3D%2244%22%20r%3D%225%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2048L45%2058H55L50%2048Z%22%20fill%3D%22%23E4E4E7%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M26%2030L37%2032L48%2024%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M74%2030L63%2032L52%2024%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M32%2064C36%2072%2044%2076%2050%2076C56%2076%2064%2072%2068%2064%22%20stroke%3D%22%23A1A1AA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%0A%3C%2Fsvg%3E",
  },
  {
    id: "eagle",
    name: "Falcon",
    description: "Vision & Speed",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2024L58%2042L78%2044L62%2056L68%2076L50%2064L32%2076L38%2056L22%2044L42%2042L50%2024Z%22%20fill%3D%22%2318181B%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2024V64%22%20stroke%3D%22%23E4E4E7%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M58%2042L50%2064L42%2042%22%20stroke%3D%22%23A1A1AA%22%20stroke-width%3D%221.2%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2244%22%20r%3D%222.5%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%3C%2Fsvg%3E",
  },
  {
    id: "stag",
    name: "Stag",
    description: "Enduring & Noble",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2048L44%2060L46%2076H54L56%2060L50%2048Z%22%20fill%3D%22%2318181B%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M48%2050C42%2044%2032%2038%2024%2038M24%2038L22%2030M24%2038L32%2030M32%2038C32%2032%2036%2026%2040%2022%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M52%2050C58%2044%2068%2038%2076%2038M76%2038L78%2030M76%2038L68%2030M68%2038C68%2032%2064%2026%2060%2022%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2256%22%20r%3D%222%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%3C%2Fsvg%3E",
  },
  {
    id: "lion",
    name: "Lion",
    description: "Courage & Leadership",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2026L64%2034L74%2048L68%2066L50%2078L32%2066L26%2048L36%2034L50%2026Z%22%20fill%3D%22%2318181B%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2036L60%2044L56%2058L50%2064L44%2058L40%2044L50%2036Z%22%20fill%3D%22%2327272A%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2246%22%20cy%3D%2248%22%20r%3D%221.8%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2254%22%20cy%3D%2248%22%20r%3D%221.8%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2052V57M48%2059H52%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2026V36M36%2034L40%2044M64%2034L60%2044M32%2066L44%2058M68%2066L56%2058%22%20stroke%3D%22%23A1A1AA%22%20stroke-width%3D%221.2%22%2F%3E%0A%3C%2Fsvg%3E",
  },
  {
    id: "tiger",
    name: "Tiger",
    description: "Agility & Precision",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M32%2038L42%2030L50%2036L58%2030L68%2038L66%2058L50%2074L34%2058L32%2038Z%22%20fill%3D%22%2318181B%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2036V48%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M40%2042L48%2045M60%2042L52%2045%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M36%2050L46%2051M64%2050L54%2051%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2243%22%20cy%3D%2256%22%20r%3D%222%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2257%22%20cy%3D%2256%22%20r%3D%222%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2060L46%2064H54L50%2060Z%22%20fill%3D%22%23E4E4E7%22%2F%3E%0A%3C%2Fsvg%3E",
  },
  {
    id: "orbit",
    name: "Cosmos",
    description: "Vast & Exploratory",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Cg%20transform%3D%22translate(50%2C50)%20rotate(-30)%20translate(-50%2C-50)%22%3E%0A%20%20%20%20%3Cellipse%20cx%3D%2250%22%20cy%3D%2250%22%20rx%3D%2234%22%20ry%3D%2214%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%20%20%3Cg%20transform%3D%22translate(50%2C50)%20rotate(30)%20translate(-50%2C-50)%22%3E%0A%20%20%20%20%3Cellipse%20cx%3D%2250%22%20cy%3D%2250%22%20rx%3D%2234%22%20ry%3D%2214%22%20stroke%3D%22%23A1A1AA%22%20stroke-width%3D%221.5%22%20stroke-dasharray%3D%223%203%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2212%22%20fill%3D%22%2318181B%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%225%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2274%22%20cy%3D%2236%22%20r%3D%223.5%22%20fill%3D%22%23FAFAFA%22%2F%3E%0A%3C%2Fsvg%3E",
  },
  {
    id: "prism",
    name: "Monolith",
    description: "Architect & Systems",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%3E%0A%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%2309090D%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2247%22%20stroke%3D%22%2327272A%22%20stroke-width%3D%221.5%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2024L74%2038V64L50%2078L26%2064V38L50%2024Z%22%20fill%3D%22%2318181B%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2024L74%2038L50%2052L26%2038L50%2024Z%22%20fill%3D%22%2327272A%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M50%2052V78%22%20stroke%3D%22%23FAFAFA%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2252%22%20r%3D%222.5%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A%3C%2Fsvg%3E",
  },
];
