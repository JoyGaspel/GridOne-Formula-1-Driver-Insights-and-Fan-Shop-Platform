const createProductImage = (title, primary, accent) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900' viewBox='0 0 900 900'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${primary}' />
        <stop offset='100%' stop-color='#0a0a0a' />
      </linearGradient>
    </defs>
    <rect width='900' height='900' fill='url(#bg)' />
    <circle cx='730' cy='180' r='160' fill='${accent}' opacity='0.22' />
    <circle cx='180' cy='740' r='210' fill='${accent}' opacity='0.12' />
    <rect x='80' y='120' width='740' height='520' rx='28' fill='none' stroke='${accent}' stroke-width='8' opacity='0.8' />
    <text x='90' y='700' fill='#f5f5f5' font-family='Arial' font-size='48' font-weight='700'>GRIDONE MINI STORE</text>
    <text x='90' y='770' fill='#d4d4d4' font-family='Arial' font-size='58' font-weight='700'>${title}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const STORE_CATEGORIES = [
  "All",
  "Men",
  "Women",
  "Kids",
  "Headwear",
  "Accessories",
  "Collectibles",
  "Jackets",
  "Caps",
  "Shirts",
];

export const STORE_TEAMS = [
  "All Teams",
  "McLaren",
  "Red Bull",
  "Ferrari",
  "Mercedes",
  "Williams",
  "Aston Martin",
  "Audi",
  "Racing Bulls",
  "Haas",
  "Alpine",
  "Cadillac",
];

export const STORE_DRIVERS = [
  "All Drivers",
  "Lando Norris",
  "Oscar Piastri",
  "Max Verstappen",
  "Isack Hadjar",
  "Charles Leclerc",
  "Lewis Hamilton",
  "George Russell",
  "Andrea Kimi Antonelli",
  "Alex Albon",
  "Carlos Sainz",
  "Fernando Alonso",
  "Lance Stroll",
  "Nico Hulkenberg",
  "Gabriel Bortoleto",
  "Arvid Lindblad",
  "Liam Lawson",
  "Oliver Bearman",
  "Esteban Ocon",
  "Pierre Gasly",
  "Franco Colapinto",
  "Valtteri Bottas",
  "Sergio Perez",
];

const TEAM_ID_TO_STORE_NAME = {
  red_bull: "Red Bull",
  ferrari: "Ferrari",
  mercedes: "Mercedes",
  mclaren: "McLaren",
  aston_martin: "Aston Martin",
  alpine: "Alpine",
  williams: "Williams",
  rb: "Racing Bulls",
  audi: "Audi",
  haas: "Haas",
  cadillac: "Cadillac",
};

const DRIVER_TEAM_MAP = {
  "George Russell": TEAM_ID_TO_STORE_NAME.mercedes,
  "Andrea Kimi Antonelli": TEAM_ID_TO_STORE_NAME.mercedes,
  "Charles Leclerc": TEAM_ID_TO_STORE_NAME.ferrari,
  "Lewis Hamilton": TEAM_ID_TO_STORE_NAME.ferrari,
  "Oliver Bearman": TEAM_ID_TO_STORE_NAME.haas,
  "Lando Norris": TEAM_ID_TO_STORE_NAME.mclaren,
  "Pierre Gasly": TEAM_ID_TO_STORE_NAME.alpine,
  "Max Verstappen": TEAM_ID_TO_STORE_NAME.red_bull,
  "Liam Lawson": TEAM_ID_TO_STORE_NAME.rb,
  "Arvid Lindblad": TEAM_ID_TO_STORE_NAME.rb,
  "Isack Hadjar": TEAM_ID_TO_STORE_NAME.red_bull,
  "Oscar Piastri": TEAM_ID_TO_STORE_NAME.mclaren,
  "Carlos Sainz": TEAM_ID_TO_STORE_NAME.williams,
  "Gabriel Bortoleto": TEAM_ID_TO_STORE_NAME.audi,
  "Franco Colapinto": TEAM_ID_TO_STORE_NAME.alpine,
  "Esteban Ocon": TEAM_ID_TO_STORE_NAME.haas,
  "Nico Hulkenberg": TEAM_ID_TO_STORE_NAME.audi,
  "Alex Albon": TEAM_ID_TO_STORE_NAME.williams,
  "Valtteri Bottas": TEAM_ID_TO_STORE_NAME.cadillac,
  "Sergio Perez": TEAM_ID_TO_STORE_NAME.cadillac,
  "Fernando Alonso": TEAM_ID_TO_STORE_NAME.aston_martin,
  "Lance Stroll": TEAM_ID_TO_STORE_NAME.aston_martin,
};

const RAW_STORE_PRODUCTS = [
  {
    id: "redbull-2026-verstappen-driver-tee",
    name: "Oracle Red Bull Racing 2026 Team Max Verstappen Driver T-Shirt",
    category: "Shirts",
    team: "Red Bull",
    driver: "Max Verstappen",
    price: 6762,
    stock: 22,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    description: "Official 2026 driver tee from the Red Bull Racing range.",
    details: "Short sleeve driver shirt with team branding.",
    image: "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-max-verstappen-driver-t-shirt_ss5_p-203284859+pv-1+u-ofnxsxqc4t0erhcpvnaz+v-gkeqbwrrpapazwgp4ohw.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-max-verstappen-driver-t-shirt_ss5_p-203284859+pv-1+u-ofnxsxqc4t0erhcpvnaz+v-gkeqbwrrpapazwgp4ohw.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-max-verstappen-driver-t-shirt_ss5_p-203284859+pv-2+u-ofnxsxqc4t0erhcpvnaz+v-iqv42embw0a0oomel5bz.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-max-verstappen-driver-t-shirt_ss5_p-203284859+pv-3+u-ofnxsxqc4t0erhcpvnaz+v-5bhd8k0hhfzpobljdrdq.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-max-verstappen-driver-t-shirt_ss5_p-203284859+pv-4+u-ofnxsxqc4t0erhcpvnaz+v-mubtece2q0jk3fjhbuyi.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "ferrari-2026-drivers-tee-red",
    name: "Scuderia Ferrari 2026 Drivers T-Shirt - Red",
    category: "Shirts",
    team: "Ferrari",
    driver: "Teamwear",
    price: 6841,
    stock: 18,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "2026 Ferrari drivers tee in Scuderia red.",
    details: "Classic crew neck with team graphics.",
    image: "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-drivers-t-shirt-red_ss5_p-203337064+pv-1+u-kzjrspi6r9zfzjgkqedi+v-0m3kiim5gsu7wg9oegqf.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-drivers-t-shirt-red_ss5_p-203337064+pv-1+u-kzjrspi6r9zfzjgkqedi+v-0m3kiim5gsu7wg9oegqf.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-drivers-t-shirt-red_ss5_p-203337064+pv-2+u-kzjrspi6r9zfzjgkqedi+v-0m3kiim5gsu7wg9oegqf.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-drivers-t-shirt-red_ss5_p-203337064+pv-3+u-kzjrspi6r9zfzjgkqedi+v-0m3kiim5gsu7wg9oegqf.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-drivers-t-shirt-red_ss5_p-203337064+pv-4+u-kzjrspi6r9zfzjgkqedi+v-0m3kiim5gsu7wg9oegqf.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-drivers-t-shirt-red_ss5_p-203337064+pv-5+u-kzjrspi6r9zfzjgkqedi+v-0m3kiim5gsu7wg9oegqf.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "ferrari-2026-team-tee",
    name: "Scuderia Ferrari 2026 Team T-Shirt",
    category: "Shirts",
    team: "Ferrari",
    driver: "Teamwear",
    price: 5728,
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official 2026 Ferrari team tee.",
    details: "Team and sponsor graphics throughout.",
    image: "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t-shirt_ss5_p-203337058+pv-1+u-dxcns8ic6qkbne1apobi+v-wsmq7dfcm8wj4hp584u2.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t-shirt_ss5_p-203337058+pv-1+u-dxcns8ic6qkbne1apobi+v-wsmq7dfcm8wj4hp584u2.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t-shirt_ss5_p-203337058+pv-2+u-dxcns8ic6qkbne1apobi+v-wsmq7dfcm8wj4hp584u2.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t-shirt_ss5_p-203337058+pv-3+u-dxcns8ic6qkbne1apobi+v-wsmq7dfcm8wj4hp584u2.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t-shirt_ss5_p-203337058+pv-4+u-dxcns8ic6qkbne1apobi+v-wsmq7dfcm8wj4hp584u2.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t-shirt_ss5_p-203337058+pv-5+u-dxcns8ic6qkbne1apobi+v-wsmq7dfcm8wj4hp584u2.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "mclaren-2026-team-set-up-tee-papaya",
    name: "McLaren 2026 Team Set Up T-Shirt - Papaya",
    category: "Shirts",
    team: "McLaren",
    driver: "Teamwear",
    price: 5728,
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "2026 McLaren team set up tee in papaya.",
    details: "Team branding and sponsor detailing.",
    image: "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-set-up-t-shirt-papaya_ss5_p-203337133+pv-1+u-mq4x9ckbrsubv8dxrhk3+v-moaqyac2rvwusbdcqyef.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-set-up-t-shirt-papaya_ss5_p-203337133+pv-1+u-mq4x9ckbrsubv8dxrhk3+v-moaqyac2rvwusbdcqyef.png?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-set-up-t-shirt-papaya_ss5_p-203337133+pv-2+u-mq4x9ckbrsubv8dxrhk3+v-mpkmc2omyvonqanzcfld.png?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-set-up-t-shirt-papaya_ss5_p-203337133+pv-3+u-mq4x9ckbrsubv8dxrhk3+v-l3r0ra5ikj6jklpgqpn8.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-set-up-t-shirt-papaya_ss5_p-203337133+pv-4+u-mq4x9ckbrsubv8dxrhk3+v-zibcgog4xz0whjfriz5j.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-set-up-t-shirt-papaya_ss5_p-203337133+pv-5+u-mq4x9ckbrsubv8dxrhk3+v-gsvm3bq29mtf3cu8qlge.png?_hv=2&w=1018",
    ],
  },
  {
    id: "mclaren-2026-lando-norris-driver-tee-papaya",
    name: "McLaren 2026 Team Lando Norris Driver Set Up T-Shirt - Papaya",
    category: "Shirts",
    team: "McLaren",
    driver: "Lando Norris",
    price: 11694,
    stock: 16,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "2026 Lando Norris driver tee from McLaren.",
    details: "Driver name and number with team branding.",
    image: "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-lando-norris-driver-set-up-t-shirt-papaya_ss5_p-203337135+pv-1+u-sz0f1tak97j2ra6wxdzn+v-xtbop7538sne29gaybvn.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-lando-norris-driver-set-up-t-shirt-papaya_ss5_p-203337135+pv-1+u-sz0f1tak97j2ra6wxdzn+v-xtbop7538sne29gaybvn.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-lando-norris-driver-set-up-t-shirt-papaya_ss5_p-203337135+pv-2+u-sz0f1tak97j2ra6wxdzn+v-xtbop7538sne29gaybvn.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-lando-norris-driver-set-up-t-shirt-papaya_ss5_p-203337135+pv-3+u-sz0f1tak97j2ra6wxdzn+v-xtbop7538sne29gaybvn.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-lando-norris-driver-set-up-t-shirt-papaya_ss5_p-203337135+pv-4+u-sz0f1tak97j2ra6wxdzn+v-xtbop7538sne29gaybvn.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-team-lando-norris-driver-set-up-t-shirt-papaya_ss5_p-203337135+pv-5+u-sz0f1tak97j2ra6wxdzn+v-xtbop7538sne29gaybvn.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "ferrari-2026-team-t7-half-zip",
    name: "Scuderia Ferrari 2026 Team T7 1/2 Zip Sweat",
    category: "Jackets",
    team: "Ferrari",
    driver: "Teamwear",
    price: 8989,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Official Ferrari 2026 half-zip team sweat.",
    details: "Team wear midlayer for track and travel.",
    image: "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t7-1/2-zip-sweat_ss5_p-203337050+pv-1+u-0erg9ro2tr7oifezl3q0+v-eqyfahjqxyypu57x9wcj.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t7-1/2-zip-sweat_ss5_p-203337050+pv-1+u-0erg9ro2tr7oifezl3q0+v-eqyfahjqxyypu57x9wcj.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t7-1/2-zip-sweat_ss5_p-203337050+pv-2+u-0erg9ro2tr7oifezl3q0+v-assdx1nlzxazpz7jy4bt.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-t7-1/2-zip-sweat_ss5_p-203337050+pv-3+u-0erg9ro2tr7oifezl3q0+v-jysqbvtayu52jzl1lfu1.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "redbull-2026-water-resistant-jacket",
    name: "Oracle Red Bull Racing 2026 Team Water Resistant Jacket - Unisex",
    category: "Jackets",
    team: "Red Bull",
    driver: "Teamwear",
    price: 11932,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    description: "2026 Red Bull Racing water resistant jacket.",
    details: "Replica long sleeve jacket with team branding.",
    image: "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-water-resistant-jacket-unisex_ss5_p-203284854+pv-1+u-55kia1wlsepbgdoorz4z+v-w6wqawrmf2lfrkdcpqo0.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-water-resistant-jacket-unisex_ss5_p-203284854+pv-1+u-55kia1wlsepbgdoorz4z+v-w6wqawrmf2lfrkdcpqo0.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-water-resistant-jacket-unisex_ss5_p-203284854+pv-2+u-55kia1wlsepbgdoorz4z+v-w6wqawrmf2lfrkdcpqo0.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-water-resistant-jacket-unisex_ss5_p-203284854+pv-3+u-55kia1wlsepbgdoorz4z+v-w6wqawrmf2lfrkdcpqo0.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-water-resistant-jacket-unisex_ss5_p-203284854+pv-4+u-55kia1wlsepbgdoorz4z+v-w6wqawrmf2lfrkdcpqo0.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-water-resistant-jacket-unisex_ss5_p-203284854+pv-5+u-55kia1wlsepbgdoorz4z+v-w6wqawrmf2lfrkdcpqo0.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "mclaren-mitchell-ness-windbreaker",
    name: "McLaren Mitchell & Ness Windbreaker",
    category: "Jackets",
    team: "McLaren",
    driver: "Teamwear",
    price: 24501,
    stock: 10,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Limited McLaren windbreaker from Mitchell & Ness.",
    details: "Lightweight full-zip jacket with McLaren graphics.",
    image: "https://images.footballfanatics.com/mclaren-f1-team/mclaren-mitchell-and-ness-windbreaker_ss5_p-203329597+pv-1+u-phwp5v1o1omoqvvaj0x5+v-1rdhqm3eqbxhf8ofijy9.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-mitchell-and-ness-windbreaker_ss5_p-203329597+pv-1+u-phwp5v1o1omoqvvaj0x5+v-1rdhqm3eqbxhf8ofijy9.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-mitchell-and-ness-windbreaker_ss5_p-203329597+pv-2+u-phwp5v1o1omoqvvaj0x5+v-1rdhqm3eqbxhf8ofijy9.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-mitchell-and-ness-windbreaker_ss5_p-203329597+pv-3+u-phwp5v1o1omoqvvaj0x5+v-1rdhqm3eqbxhf8ofijy9.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-mitchell-and-ness-windbreaker_ss5_p-203329597+pv-4+u-phwp5v1o1omoqvvaj0x5+v-1rdhqm3eqbxhf8ofijy9.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-mitchell-and-ness-windbreaker_ss5_p-203329597+pv-5+u-phwp5v1o1omoqvvaj0x5+v-1rdhqm3eqbxhf8ofijy9.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "redbull-2026-softshell-jacket",
    name: "Oracle Red Bull Racing 2026 Team Softshell Jacket - Unisex",
    category: "Jackets",
    team: "Red Bull",
    driver: "Teamwear",
    price: 11535,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    description: "2026 Red Bull Racing softshell jacket.",
    details: "Full zip softshell with team branding.",
    image: "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-softshell-jacket-unisex_ss5_p-203284855+pv-1+u-k1iv5brllfxtxvqcdnei+v-uecunjfsycq7v4mjnyfh.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-softshell-jacket-unisex_ss5_p-203284855+pv-1+u-k1iv5brllfxtxvqcdnei+v-uecunjfsycq7v4mjnyfh.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-softshell-jacket-unisex_ss5_p-203284855+pv-2+u-k1iv5brllfxtxvqcdnei+v-uecunjfsycq7v4mjnyfh.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-softshell-jacket-unisex_ss5_p-203284855+pv-3+u-k1iv5brllfxtxvqcdnei+v-uecunjfsycq7v4mjnyfh.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-softshell-jacket-unisex_ss5_p-203284855+pv-4+u-k1iv5brllfxtxvqcdnei+v-uecunjfsycq7v4mjnyfh.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-2026-team-softshell-jacket-unisex_ss5_p-203284855+pv-5+u-k1iv5brllfxtxvqcdnei+v-uecunjfsycq7v4mjnyfh.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "mclaren-2026-quarter-zip-midlayer",
    name: "McLaren 2026 1/4 Zip Midlayer Top - Unisex",
    category: "Jackets",
    team: "McLaren",
    driver: "Teamwear",
    price: 17183,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "2026 McLaren midlayer top with quarter zip.",
    details: "Long sleeve midlayer for race weekends.",
    image: "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-1/4-zip-midlayer-top-unisex_ss5_p-203337139+pv-1+u-kw7vvela9f0e3jtbfsye+v-vlbwlp7st8cgv3ir3yma.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-1/4-zip-midlayer-top-unisex_ss5_p-203337139+pv-1+u-kw7vvela9f0e3jtbfsye+v-vlbwlp7st8cgv3ir3yma.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-1/4-zip-midlayer-top-unisex_ss5_p-203337139+pv-2+u-kw7vvela9f0e3jtbfsye+v-vlbwlp7st8cgv3ir3yma.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-1/4-zip-midlayer-top-unisex_ss5_p-203337139+pv-3+u-kw7vvela9f0e3jtbfsye+v-vlbwlp7st8cgv3ir3yma.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-1/4-zip-midlayer-top-unisex_ss5_p-203337139+pv-4+u-kw7vvela9f0e3jtbfsye+v-vlbwlp7st8cgv3ir3yma.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-2026-1/4-zip-midlayer-top-unisex_ss5_p-203337139+pv-5+u-kw7vvela9f0e3jtbfsye+v-vlbwlp7st8cgv3ir3yma.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "redbull-verstappen-9seventy-cap-navy",
    name: "Oracle Red Bull Racing New Era Max Verstappen 9SEVENTY Cap - Navy - Unisex",
    category: "Caps",
    team: "Red Bull",
    driver: "Max Verstappen",
    price: 3341,
    stock: 18,
    sizes: ["One Size"],
    description: "New Era 9SEVENTY cap inspired by Max Verstappen.",
    details: "Adjustable snap closure.",
    image: "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-new-era-max-verstappen-9seventy-cap-navy-unisex_ss5_p-203401575+pv-1+u-wqp17s2xlj7qvogaaeok+v-1ljebc7bne3rq7uqic6u.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-new-era-max-verstappen-9seventy-cap-navy-unisex_ss5_p-203401575+pv-1+u-wqp17s2xlj7qvogaaeok+v-1ljebc7bne3rq7uqic6u.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-new-era-max-verstappen-9seventy-cap-navy-unisex_ss5_p-203401575+pv-2+u-wqp17s2xlj7qvogaaeok+v-brzb5raannvitvvrefcf.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-new-era-max-verstappen-9seventy-cap-navy-unisex_ss5_p-203401575+pv-3+u-wqp17s2xlj7qvogaaeok+v-kxoro43vevo59t7hds2b.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/red-bull-racing/oracle-red-bull-racing-new-era-max-verstappen-9seventy-cap-navy-unisex_ss5_p-203401575+pv-4+u-wqp17s2xlj7qvogaaeok+v-wjcifjgeht47skmdv2wn.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "mclaren-piastri-australia-gp-cap",
    name: "McLaren Special Edition Oscar Piastri Australia GP Cap - Unisex",
    category: "Caps",
    team: "McLaren",
    driver: "Oscar Piastri",
    price: 6364,
    stock: 16,
    sizes: ["One Size"],
    description: "Special edition Piastri Australia GP cap.",
    details: "Adjustable snapback closure.",
    image: "https://images.footballfanatics.com/mclaren-f1-team/mclaren-special-edition-oscar-piastri-australia-gp-cap-unisex_ss5_p-203687377+pv-1+u-yihdwxg3enc6lkfl11fi+v-cj0xwgxkyl7c7oe2zuvy.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-special-edition-oscar-piastri-australia-gp-cap-unisex_ss5_p-203687377+pv-1+u-yihdwxg3enc6lkfl11fi+v-cj0xwgxkyl7c7oe2zuvy.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-special-edition-oscar-piastri-australia-gp-cap-unisex_ss5_p-203687377+pv-2+u-yihdwxg3enc6lkfl11fi+v-cj0xwgxkyl7c7oe2zuvy.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-special-edition-oscar-piastri-australia-gp-cap-unisex_ss5_p-203687377+pv-3+u-yihdwxg3enc6lkfl11fi+v-cj0xwgxkyl7c7oe2zuvy.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-special-edition-oscar-piastri-australia-gp-cap-unisex_ss5_p-203687377+pv-4+u-yihdwxg3enc6lkfl11fi+v-cj0xwgxkyl7c7oe2zuvy.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/mclaren-f1-team/mclaren-special-edition-oscar-piastri-australia-gp-cap-unisex_ss5_p-203687377+pv-5+u-yihdwxg3enc6lkfl11fi+v-cj0xwgxkyl7c7oe2zuvy.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "ferrari-2025-las-vegas-race-cap",
    name: "Scuderia Ferrari 2025 Special Edition Las Vegas Race Cap",
    category: "Caps",
    team: "Ferrari",
    driver: "Teamwear",
    price: 1432,
    stock: 14,
    sizes: ["One Size"],
    description: "Special edition Ferrari Las Vegas race cap.",
    details: "Mesh panels with Ferrari crest.",
    image: "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2025-special-edition-las-vegas-race-cap_ss5_p-202620492+pv-1+u-brqmdlwqqfzzbwqm1ipt+v-hulwmhv3szelq3p3ppxa.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2025-special-edition-las-vegas-race-cap_ss5_p-202620492+pv-1+u-brqmdlwqqfzzbwqm1ipt+v-hulwmhv3szelq3p3ppxa.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2025-special-edition-las-vegas-race-cap_ss5_p-202620492+pv-2+u-brqmdlwqqfzzbwqm1ipt+v-hulwmhv3szelq3p3ppxa.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2025-special-edition-las-vegas-race-cap_ss5_p-202620492+pv-3+u-brqmdlwqqfzzbwqm1ipt+v-hulwmhv3szelq3p3ppxa.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2025-special-edition-las-vegas-race-cap_ss5_p-202620492+pv-4+u-brqmdlwqqfzzbwqm1ipt+v-hulwmhv3szelq3p3ppxa.jpg?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2025-special-edition-las-vegas-race-cap_ss5_p-202620492+pv-5+u-brqmdlwqqfzzbwqm1ipt+v-hulwmhv3szelq3p3ppxa.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "cadillac-2026-sergio-perez-team-cap-black",
    name: "Cadillac Tommy Hilfiger 2026 Sergio Perez Team Cap - Black",
    category: "Caps",
    team: "Cadillac",
    driver: "Sergio Perez",
    price: 3978,
    stock: 15,
    sizes: ["One Size"],
    description: "Cadillac F1 debut season team cap.",
    details: "Replica teamwear with adjustable closure.",
    image: "https://f1store.formula1.com/content/ws/all/bcf8e940-60fc-47b0-8295-63897a33f9ca__2000X2000.png?w=570",
    images: [
      "https://images.unsplash.com/photo-1723797447445-a7a81aa8078a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1510681217935-5bc73636d974?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "ferrari-2026-charles-leclerc-cap-red",
    name: "Scuderia Ferrari 2026 Team Charles Leclerc Cap - Red",
    category: "Caps",
    team: "Ferrari",
    driver: "Charles Leclerc",
    price: 6523,
    stock: 16,
    sizes: ["One Size"],
    description: "2026 Charles Leclerc team cap.",
    details: "Trucker cap with adjustable snap closure.",
    image: "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-charles-leclerc-cap-red_ss5_p-203337061+pv-1+u-qshngwssikhmsm4exgfx+v-4f0uz0xes18krokxol41.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-charles-leclerc-cap-red_ss5_p-203337061+pv-1+u-qshngwssikhmsm4exgfx+v-4f0uz0xes18krokxol41.png?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-charles-leclerc-cap-red_ss5_p-203337061+pv-2+u-qshngwssikhmsm4exgfx+v-4f0uz0xes18krokxol41.png?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-charles-leclerc-cap-red_ss5_p-203337061+pv-3+u-qshngwssikhmsm4exgfx+v-4f0uz0xes18krokxol41.png?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-charles-leclerc-cap-red_ss5_p-203337061+pv-4+u-qshngwssikhmsm4exgfx+v-4f0uz0xes18krokxol41.png?_hv=2&w=1018",
      "https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2026-team-charles-leclerc-cap-red_ss5_p-203337061+pv-5+u-qshngwssikhmsm4exgfx+v-4f0uz0xes18krokxol41.png?_hv=2&w=1018",
    ],
  },
  {
    id: "mclaren-waist-bag",
    name: "McLaren Waist Bag",
    category: "Accessories",
    team: "McLaren",
    driver: "Teamwear",
    price: 2864,
    stock: 30,
    sizes: ["One Size"],
    description: "Compact waist bag with McLaren branding.",
    details: "Everyday carry with adjustable strap.",
    image: "https://images.footballfanatics.com/mclaren-f1-team/mclaren-waist-bag_ss5_p-203337149+u-myddtxuijfyaemvypnag+v-qu6fvbyhftpralqt6br4.jpg?_hv=2&w=532",
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "f1-hooded-poncho-2pk",
    name: "Formula 1 Hooded Poncho 2pk",
    category: "Accessories",
    team: "Formula 1",
    driver: "Teamwear",
    price: 955,
    stock: 40,
    sizes: ["One Size"],
    description: "Two-pack hooded ponchos for race day weather.",
    details: "Lightweight ponchos for wet conditions.",
    image: "https://images.footballfanatics.com/formula-1-merchandise/formula-1-hooded-poncho-2pk_ss5_p-202369086+u-pnwtrz0sjgkookqo2qes+v-wwpcsnnowvmmykv5suqz.jpg?_hv=2&w=532",
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "mv-official-2-pack-socks-navy-grey",
    name: "MV Official 2 Pack Socks - Navy/Grey",
    category: "Accessories",
    team: "Red Bull",
    driver: "Max Verstappen",
    price: 1034,
    stock: 50,
    sizes: ["One Size"],
    description: "Max Verstappen official two-pack socks.",
    details: "Everyday crew socks with MV branding.",
    image: "https://images.footballfanatics.com/mv-official/mv-official-2-pack-socks-navy/grey_ss5_p-203761183+u-vlxpbg9hdm39qqo68ybm+v-sk6ttdodvu56zgbgbqej.jpg?_hv=2&w=532",
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "alfa-romeo-sauber-kimi-logo-face-covering",
    name: "Alfa Romeo Sauber F1 Kimi Logo Face Covering",
    category: "Accessories",
    team: "Kick Sauber",
    driver: "Teamwear",
    price: 716,
    stock: 40,
    sizes: ["One Size"],
    description: "Team face covering with Kimi logo.",
    details: "Reusable face covering.",
    image: "https://images.footballfanatics.com/f1-drivers/alfa-romeo-sauber-f1-kimi-by-west-coast-choppers-logo-face-covering_ss4_p-13313600+u-6qgwsau573itd6yasyve+v-c38cd3fb0fd043ea811449fe097d3acf.jpg?_hv=2&w=532",
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "mercedes-teamwear-crossbody-bag",
    name: "Mercedes AMG Petronas adidas F1 Teamwear Crossbody Bag",
    category: "Accessories",
    team: "Mercedes",
    driver: "Teamwear",
    price: 2784,
    stock: 26,
    sizes: ["One Size"],
    description: "Mercedes teamwear crossbody bag.",
    details: "Compact crossbody carry with team branding.",
    image: "https://images.footballfanatics.com/mercedes-amg-petronas-f1-team/mercedes-amg-petronas-adidas-f1-teamwear-crossbody-bag_ss5_p-203336901+u-vtjfbjtjmbz6gf2bdobw+v-tfu0024znxak0choqags.png?_hv=2&w=532",
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "headwear-podium-cap-black",
    name: "Podium Cap - Black",
    category: "Headwear",
    team: "Formula 1",
    driver: "Teamwear",
    price: 2150,
    stock: 22,
    sizes: ["One Size"],
    description: "Everyday podium-style cap in matte black.",
    details: "Adjustable strap, breathable eyelets, embroidered crest.",
    image: createProductImage("Podium Cap", "#14181f", "#ff9f1c"),
    images: [
      "https://images.unsplash.com/photo-1723797447445-a7a81aa8078a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1510681217935-5bc73636d974?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "headwear-race-day-bucket-hat",
    name: "Race Day Bucket Hat",
    category: "Headwear",
    team: "McLaren",
    driver: "Teamwear",
    price: 2390,
    stock: 18,
    sizes: ["One Size"],
    description: "Sun-ready bucket hat for race weekends.",
    details: "Lightweight twill, stitched brim, soft inner band.",
    image: createProductImage("Bucket Hat", "#1b0f08", "#ff8a00"),
    images: [
      "https://images.unsplash.com/photo-1723797447445-a7a81aa8078a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1510681217935-5bc73636d974?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "headwear-heritage-snapback",
    name: "Heritage Snapback Cap",
    category: "Headwear",
    team: "Ferrari",
    driver: "Teamwear",
    price: 2550,
    stock: 20,
    sizes: ["One Size"],
    description: "Retro snapback with heritage crest patch.",
    details: "Structured crown, flat brim, adjustable snap.",
    image: createProductImage("Heritage Snapback", "#7a0000", "#ffcc5c"),
    images: [
      "https://images.unsplash.com/photo-1723797447445-a7a81aa8078a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1510681217935-5bc73636d974?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "accessory-team-pin-pack",
    name: "Team Pin Pack (Set of 4)",
    category: "Accessories",
    team: "Red Bull",
    driver: "Teamwear",
    price: 890,
    stock: 45,
    sizes: ["One Size"],
    description: "Collector pin set featuring team icons.",
    details: "Hard enamel pins with metal backing.",
    image: createProductImage("Pin Pack", "#0c1a3b", "#ffd100"),
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "accessory-paddock-sunglasses",
    name: "Paddock Sunglasses",
    category: "Accessories",
    team: "Mercedes",
    driver: "Teamwear",
    price: 3190,
    stock: 30,
    sizes: ["One Size"],
    description: "Polarized sunglasses with sleek team styling.",
    details: "UV400 lenses, matte finish, branded case.",
    image: createProductImage("Sunglasses", "#0f171f", "#00d2be"),
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "accessory-tech-zip-wallet",
    name: "Tech Zip Wallet",
    category: "Accessories",
    team: "McLaren",
    driver: "Teamwear",
    price: 1490,
    stock: 35,
    sizes: ["One Size"],
    description: "Slim wallet with zip coin compartment.",
    details: "RFID lining, embossed logo, durable nylon.",
    image: createProductImage("Zip Wallet", "#25140b", "#ff8a00"),
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "women-team-tee-rose",
    name: "Women’s Team Tee - Rose",
    category: "Women",
    team: "Ferrari",
    driver: "Teamwear",
    price: 3890,
    stock: 24,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Women’s cut team tee with soft-touch fabric.",
    details: "Crew neck, taped seams, sponsor print.",
    image: createProductImage("Women Tee", "#7a0000", "#ff6b6b"),
    images: [
      "https://images.unsplash.com/photo-1508853363419-a9263d752c59?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1565012355505-9cefe58e4fd3?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
      "https://images.unsplash.com/photo-1615957500739-f68f9d53525a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "women-zip-hoodie-navy",
    name: "Women’s Zip Hoodie - Navy",
    category: "Women",
    team: "Red Bull",
    driver: "Teamwear",
    price: 5290,
    stock: 16,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Soft fleece hoodie with team emblem.",
    details: "Full zip, brushed interior, front pockets.",
    image: createProductImage("Women Hoodie", "#0a1a3f", "#ffb703"),
    images: [
      "https://images.unsplash.com/photo-1508853363419-a9263d752c59?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1565012355505-9cefe58e4fd3?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
      "https://images.unsplash.com/photo-1615957500739-f68f9d53525a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "women-track-jacket-silver",
    name: "Women’s Track Jacket - Silver",
    category: "Women",
    team: "Mercedes",
    driver: "Teamwear",
    price: 6490,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Slim-fit track jacket with metallic accents.",
    details: "Two-way zip, ribbed cuffs, contrast piping.",
    image: createProductImage("Women Jacket", "#1d1f24", "#00d2be"),
    images: [
      "https://images.unsplash.com/photo-1508853363419-a9263d752c59?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1565012355505-9cefe58e4fd3?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
      "https://images.unsplash.com/photo-1615957500739-f68f9d53525a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "women-race-day-tee-white",
    name: "Women’s Race Day Tee - White",
    category: "Women",
    team: "McLaren",
    driver: "Teamwear",
    price: 3790,
    stock: 22,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Race day tee in women’s fit.",
    details: "Soft cotton blend with bold crest print.",
    image: createProductImage("Women Race Tee", "#f2f2f2", "#ff8a00"),
    images: [
      "https://images.unsplash.com/photo-1508853363419-a9263d752c59?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1565012355505-9cefe58e4fd3?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
      "https://images.unsplash.com/photo-1615957500739-f68f9d53525a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "kids-graphic-tee-orange",
    name: "Kids Graphic Tee - Orange",
    category: "Kids",
    team: "McLaren",
    driver: "Teamwear",
    price: 2190,
    stock: 30,
    sizes: ["2-4Y", "5-6Y", "7-8Y", "9-11Y"],
    description: "Youth tee with bold race graphics.",
    details: "Soft cotton, tagless collar, durable print.",
    image: createProductImage("Kids Tee", "#ff8a00", "#1a1a1a"),
    images: [
      "https://images.unsplash.com/photo-1558140275-6b7b7bf2cfa1?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1566845983206-173d95ecc597?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1583249483442-c665ed9c21da?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "kids-hoodie-blue",
    name: "Kids Team Hoodie - Blue",
    category: "Kids",
    team: "Red Bull",
    driver: "Teamwear",
    price: 2990,
    stock: 20,
    sizes: ["2-4Y", "5-6Y", "7-8Y", "9-11Y"],
    description: "Warm fleece hoodie for young fans.",
    details: "Kangaroo pocket, ribbed cuffs, soft lining.",
    image: createProductImage("Kids Hoodie", "#12326b", "#ffd100"),
    images: [
      "https://images.unsplash.com/photo-1558140275-6b7b7bf2cfa1?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1566845983206-173d95ecc597?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1583249483442-c665ed9c21da?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "kids-track-jacket",
    name: "Kids Track Jacket",
    category: "Kids",
    team: "Mercedes",
    driver: "Teamwear",
    price: 3490,
    stock: 18,
    sizes: ["2-4Y", "5-6Y", "7-8Y", "9-11Y"],
    description: "Lightweight kids track jacket.",
    details: "Full zip, breathable fabric, team crest.",
    image: createProductImage("Kids Jacket", "#1a1f2b", "#00d2be"),
    images: [
      "https://images.unsplash.com/photo-1558140275-6b7b7bf2cfa1?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1566845983206-173d95ecc597?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1583249483442-c665ed9c21da?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "kids-cap-youth",
    name: "Kids Team Cap",
    category: "Kids",
    team: "Ferrari",
    driver: "Teamwear",
    price: 1790,
    stock: 26,
    sizes: ["One Size"],
    description: "Youth-sized cap with adjustable strap.",
    details: "Curved brim, embroidered crest, lightweight.",
    image: createProductImage("Kids Cap", "#7a0000", "#ffcc5c"),
    images: [
      "https://images.unsplash.com/photo-1558140275-6b7b7bf2cfa1?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1566845983206-173d95ecc597?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1583249483442-c665ed9c21da?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "collectible-mini-helmet",
    name: "Mini Helmet Collectible",
    category: "Collectibles",
    team: "Red Bull",
    driver: "Max Verstappen",
    price: 4990,
    stock: 12,
    sizes: ["One Size"],
    description: "Display-ready mini helmet collectible.",
    details: "Scale model with display stand.",
    image: createProductImage("Mini Helmet", "#0e1b3b", "#ffd100"),
    images: [
      "https://images.unsplash.com/photo-1511415518647-9e5da4fd803f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1667463439450-7d85f50426ea?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1511453650475-ca175d4aede0?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
    ],
  },
  {
    id: "collectible-diecast-car",
    name: "1:43 Diecast Team Car",
    category: "Collectibles",
    team: "Ferrari",
    driver: "Teamwear",
    price: 5690,
    stock: 10,
    sizes: ["One Size"],
    description: "Diecast replica car for collectors.",
    details: "Detailed paint, display case included.",
    image: createProductImage("Diecast Car", "#7a0000", "#ff6b6b"),
    images: [
      "https://images.unsplash.com/photo-1511415518647-9e5da4fd803f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1667463439450-7d85f50426ea?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1511453650475-ca175d4aede0?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
    ],
  },
  {
    id: "collectible-paddock-poster",
    name: "Paddock Poster Set",
    category: "Collectibles",
    team: "Formula 1",
    driver: "Teamwear",
    price: 1690,
    stock: 28,
    sizes: ["One Size"],
    description: "Set of 3 premium paddock posters.",
    details: "Matte finish, 18x24 inch size.",
    image: createProductImage("Poster Set", "#1a1f2b", "#ff4d4d"),
    images: [
      "https://images.unsplash.com/photo-1511415518647-9e5da4fd803f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1667463439450-7d85f50426ea?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1511453650475-ca175d4aede0?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
    ],
  },
  {
    id: "collectible-pit-lane-badge",
    name: "Pit Lane Badge Replica",
    category: "Collectibles",
    team: "McLaren",
    driver: "Teamwear",
    price: 1290,
    stock: 25,
    sizes: ["One Size"],
    description: "Replica pit lane badge with lanyard.",
    details: "Printed badge, display-ready.",
    image: createProductImage("Pit Badge", "#20160c", "#ff8a00"),
    images: [
      "https://images.unsplash.com/photo-1511415518647-9e5da4fd803f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1667463439450-7d85f50426ea?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1511453650475-ca175d4aede0?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
    ],
  },
  {
    id: "audi-2026-replica-team-tshirt",
    name: "Audi F1 2026 Replica Team T-Shirt",
    category: "Shirts",
    team: "Audi",
    driver: "Teamwear",
    price: 8990,
    stock: 18,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official Audi F1 2026 replica team tee.",
    details: "Performance fit with team and sponsor branding.",
    image:
      "https://images.footballfanatics.com/audi/audi-f1-2026-replica-team-t-shirt_ss5_p-203336863%2Bpv-6%2Bu-vnlrvmg8urttqlpy5hoi%2Bv-udbob6sgwmqju4fdtunr.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/audi/audi-f1-2026-replica-team-t-shirt_ss5_p-203336863%2Bpv-6%2Bu-vnlrvmg8urttqlpy5hoi%2Bv-udbob6sgwmqju4fdtunr.png?_hv=2&w=1018",
    ],
  },
  {
    id: "audi-adidas-dna-hoodie-black",
    name: "Audi F1 adidas DNA Logo Hoodie - Black",
    category: "Jackets",
    team: "Audi",
    driver: "Teamwear",
    price: 9990,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Audi F1 DNA hoodie with adidas heritage branding.",
    details: "French terry pullover with drawcord hood.",
    image:
      "https://images.footballfanatics.com/audi/audi-f1-adidas-dna-logo-hoodie-black_ss5_p-203336852%2Bpv-6%2Bu-fag8csejjc26lfed1lhx%2Bv-khhuwivsnzemcrngslk4.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/audi/audi-f1-adidas-dna-logo-hoodie-black_ss5_p-203336852%2Bpv-6%2Bu-fag8csejjc26lfed1lhx%2Bv-khhuwivsnzemcrngslk4.png?_hv=2&w=1018",
    ],
  },
  {
    id: "audi-adidas-track-jacket",
    name: "Audi F1 adidas Track Jacket",
    category: "Jackets",
    team: "Audi",
    driver: "Teamwear",
    price: 12990,
    stock: 10,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Packable Audi F1 paddock track jacket.",
    details: "Loose fit with reflective accents and zip closure.",
    image:
      "https://images.footballfanatics.com/audi/audi-f1-adidas-f1-track-jacket_ss5_p-203336855%2Bpv-1%2Bu-c0yl64yxkqnkugorqrsz%2Bv-f9xqzqpqab1xodvl93ck.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/audi/audi-f1-adidas-f1-track-jacket_ss5_p-203336855%2Bpv-1%2Bu-c0yl64yxkqnkugorqrsz%2Bv-f9xqzqpqab1xodvl93ck.png?_hv=2&w=1018",
    ],
  },
  {
    id: "audi-2026-hulkenberg-driver-cap",
    name: "Audi F1 2026 Nico Hulkenberg Driver Cap",
    category: "Caps",
    team: "Audi",
    driver: "Nico Hulkenberg",
    price: 3390,
    stock: 26,
    sizes: ["One Size"],
    description: "Driver cap inspired by Nico Hulkenberg's 2026 kit.",
    details: "Structured fit with sweat-wicking fabric.",
    image:
      "https://images.footballfanatics.com/audi/audi-f1-2026-nico-hulkenberg-driver-cap_ss5_p-203336860%2Bpv-1%2Bu-feg3eearsth9sbco73cg%2Bv-i7lyknnl9ep08pezobgh.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/audi/audi-f1-2026-nico-hulkenberg-driver-cap_ss5_p-203336860%2Bpv-1%2Bu-feg3eearsth9sbco73cg%2Bv-i7lyknnl9ep08pezobgh.png?_hv=2&w=1018",
    ],
  },
  {
    id: "audi-2026-engineer-tracktop-womens",
    name: "Audi F1 2026 Engineer Tracktop - Womens",
    category: "Jackets",
    team: "Audi",
    driver: "Teamwear",
    price: 9490,
    stock: 12,
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "2XL"],
    description: "Audi F1 engineer tracktop with climawarm tech.",
    details: "Doubleknit tracktop with full zip.",
    image:
      "https://images.footballfanatics.com/audi/audi-f1-2026-teamwear-engineer-tracktop-womens_ss5_p-203336945%2Bpv-6%2Bu-golp7ghtq5kvlt1aja0w%2Bv-ezlza85uyd6nxvgbzevf.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/audi/audi-f1-2026-teamwear-engineer-tracktop-womens_ss5_p-203336945%2Bpv-6%2Bu-golp7ghtq5kvlt1aja0w%2Bv-ezlza85uyd6nxvgbzevf.png?_hv=2&w=1018",
    ],
  },
  {
    id: "vcarb-2026-team-tshirt",
    name: "VCARB Hugo 2026 Team T-Shirt",
    category: "Shirts",
    team: "Racing Bulls",
    driver: "Teamwear",
    price: 7990,
    stock: 18,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Official VCARB 2026 team tee with sponsor graphics.",
    details: "Crew neck with all-over team branding.",
    image:
      "https://images.footballfanatics.com/vcarb/vcarb-hugo-2026-team-t-shirt_ss5_p-203374210%2Bpv-1%2Bu-ncfnx9bi7cenxylgjnwh%2Bv-pkm6krkrzxl65q1ziv7i.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/vcarb/vcarb-hugo-2026-team-t-shirt_ss5_p-203374210%2Bpv-1%2Bu-ncfnx9bi7cenxylgjnwh%2Bv-pkm6krkrzxl65q1ziv7i.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "vcarb-2024-team-full-zip-hoodie",
    name: "RB Cash App 2024 Team Full Zip Hoodie",
    category: "Jackets",
    team: "Racing Bulls",
    driver: "Teamwear",
    price: 8990,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official 2024 team full zip hoodie.",
    details: "Zip front with team and sponsor logos.",
    image:
      "https://images.footballfanatics.com/vcarb/rb-cash-app-2024-team-full-zip-hoodie_ss5_p-201289643%2Bpv-1%2Bu-u8iimfsxtqpfbes2n2uc%2Bv-cksamufg3n1uxojitos6.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/vcarb/rb-cash-app-2024-team-full-zip-hoodie_ss5_p-201289643%2Bpv-1%2Bu-u8iimfsxtqpfbes2n2uc%2Bv-cksamufg3n1uxojitos6.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "vcarb-2024-team-quarter-zip",
    name: "RB Cash App 2024 Team 1/4 Zip Sweatshirt",
    category: "Jackets",
    team: "Racing Bulls",
    driver: "Teamwear",
    price: 7490,
    stock: 10,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official 2024 VCARB team quarter-zip.",
    details: "Lightweight sweatshirt with team detailing.",
    image:
      "https://f1store.formula1.com/content/ws/all/dc91637d-3f73-47db-ae15-22ff6eafc0a7__1440X1116.png",
    images: [
      "https://f1store.formula1.com/content/ws/all/dc91637d-3f73-47db-ae15-22ff6eafc0a7__1440X1116.png",
    ],
  },
  {
    id: "vcarb-fanwear-hoodie-black",
    name: "VCARB Hugo Fanwear Hoodie - Black",
    category: "Jackets",
    team: "Racing Bulls",
    driver: "Teamwear",
    price: 8290,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Fanwear hoodie with VCARB branding.",
    details: "Pullover fit with sponsor graphics.",
    image:
      "https://images.footballfanatics.com/vcarb/vcarb-hugo-fanwear-hoodie-black_ss5_p-202284798%2Bpv-1%2Bu-11kqpxxpfgrmyqkpsguf%2Bv-dkmlglvjsq3jhbocjktu.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/vcarb/vcarb-hugo-fanwear-hoodie-black_ss5_p-202284798%2Bpv-1%2Bu-11kqpxxpfgrmyqkpsguf%2Bv-dkmlglvjsq3jhbocjktu.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "vcarb-lego-race-car",
    name: "Visa Cash App RB VCARB 01 F1 LEGO Race Car",
    category: "Collectibles",
    team: "Racing Bulls",
    driver: "Teamwear",
    price: 2390,
    stock: 22,
    sizes: ["One Size"],
    description: "LEGO Speed Champions VCARB 01 race car set.",
    details: "Collectible F1 build for display.",
    image:
      "https://images.footballfanatics.com/vcarb/visa-cash-app-rb-vcarb-01-f1%C2%AE-lego%C2%AE-race-car_ss5_p-202284780%2Bpv-1%2Bu-xxr0qiz3fkgsr3krr7ho%2Bv-9bjqkurdgt7tb0usjksz.png?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/vcarb/visa-cash-app-rb-vcarb-01-f1%C2%AE-lego%C2%AE-race-car_ss5_p-202284780%2Bpv-1%2Bu-xxr0qiz3fkgsr3krr7ho%2Bv-9bjqkurdgt7tb0usjksz.png?_hv=2&w=1018",
    ],
  },
  {
    id: "haas-2026-team-overhead-hoodie",
    name: "Haas 2026 Team Overhead Hoodie",
    category: "Jackets",
    team: "Haas",
    driver: "Teamwear",
    price: 8990,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    description: "Official Haas 2026 team overhead hoodie.",
    details: "Castore teamwear with sponsor branding.",
    image:
      "https://images.footballfanatics.com/haas-f1-team/haas-2026-team-overhead-hoodie_ss5_p-203284828%2Bpv-1%2Bu-aizddf1pbyc93skzaelg%2Bv-xzrklho4pilplh04r93q.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/haas-f1-team/haas-2026-team-overhead-hoodie_ss5_p-203284828%2Bpv-1%2Bu-aizddf1pbyc93skzaelg%2Bv-xzrklho4pilplh04r93q.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "haas-2025-team-polo",
    name: "Haas F1 Moneygram 2025 Team Polo",
    category: "Shirts",
    team: "Haas",
    driver: "Teamwear",
    price: 6490,
    stock: 18,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    description: "Official 2025 Haas team polo.",
    details: "Team and sponsor logos with zip collar.",
    image:
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-moneygram-2025-team-polo_ss5_p-202620507%2Bpv-1%2Bu-l8w0vusihxp29fysdkit%2Bv-t1wvzo1kxgf7kxmcjuty.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-moneygram-2025-team-polo_ss5_p-202620507%2Bpv-1%2Bu-l8w0vusihxp29fysdkit%2Bv-t1wvzo1kxgf7kxmcjuty.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "haas-2025-team-tshirt-white",
    name: "Haas F1 Moneygram 2025 Team T-Shirt - White",
    category: "Shirts",
    team: "Haas",
    driver: "Teamwear",
    price: 5190,
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    description: "Official 2025 Haas team tee in white.",
    details: "Classic crew neck with sponsor branding.",
    image:
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-moneygram-2025-team-t-shirt-white_ss5_p-202620506%2Bu-rw62st7pcmowopuiatwq%2Bv-r9j2gyboblp8dkhran79.jpg?_hv=2&w=400",
    images: [
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-moneygram-2025-team-t-shirt-white_ss5_p-202620506%2Bu-rw62st7pcmowopuiatwq%2Bv-r9j2gyboblp8dkhran79.jpg?_hv=2&w=400",
    ],
  },
  {
    id: "haas-2025-team-fitted-zip-sweater",
    name: "Haas F1 Moneygram 2025 Team Fitted Zip Sweater",
    category: "Jackets",
    team: "Haas",
    driver: "Teamwear",
    price: 7990,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    description: "Official 2025 fitted zip sweater in team colors.",
    details: "Zip front with premium team styling.",
    image:
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-moneygram-2025-team-fitted-zip-sweater_ss5_p-202620509%2Bu-aohp4vocnmkwvhnbrhno%2Bv-ko6qbisqyx9g4rqy86c1.jpg?_hv=2&w=400",
    images: [
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-moneygram-2025-team-fitted-zip-sweater_ss5_p-202620509%2Bu-aohp4vocnmkwvhnbrhno%2Bv-ko6qbisqyx9g4rqy86c1.jpg?_hv=2&w=400",
    ],
  },
  {
    id: "haas-2026-team-trucker-cap",
    name: "Haas F1 Team New Era Seasonal 9FORTY Trucker Cap",
    category: "Caps",
    team: "Haas",
    driver: "Teamwear",
    price: 2390,
    stock: 26,
    sizes: ["One Size"],
    description: "New Era 9FORTY trucker cap for Haas fans.",
    details: "Structured crown with mesh back panels.",
    image:
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-team-new-era-seasonal-9forty-trucker-cap-unisex_ss5_p-203342222%2Bpv-1%2Bu-ou6sddowlcg3ja3kwjwy%2Bv-s584az5oyudrxnj2nlcs.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/haas-f1-team/haas-f1-team-new-era-seasonal-9forty-trucker-cap-unisex_ss5_p-203342222%2Bpv-1%2Bu-ou6sddowlcg3ja3kwjwy%2Bv-s584az5oyudrxnj2nlcs.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "cadillac-logo-hoodie-black",
    name: "Cadillac Tommy Hilfiger Logo Hoodie - Black",
    category: "Jackets",
    team: "Cadillac",
    driver: "Teamwear",
    price: 10990,
    stock: 12,
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL"],
    description: "Cadillac F1 fanwear hoodie with Tommy Hilfiger trim.",
    details: "Pullover hoodie with Cadillac F1 branding.",
    image:
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-hoodie-black_ss5_p-203721313%2Bpv-1%2Bu-w1szgeeudilr3m6azq2b%2Bv-w01spauwclnrkdhqhvz4.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-hoodie-black_ss5_p-203721313%2Bpv-1%2Bu-w1szgeeudilr3m6azq2b%2Bv-w01spauwclnrkdhqhvz4.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "cadillac-logo-cap-white",
    name: "Cadillac Tommy Hilfiger Logo Cap - White",
    category: "Caps",
    team: "Cadillac",
    driver: "Teamwear",
    price: 2990,
    stock: 28,
    sizes: ["One Size"],
    description: "Cadillac F1 logo cap with Tommy Hilfiger details.",
    details: "Structured crown with adjustable strap.",
    image:
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-cap-white-unisex_ss5_p-203721307%2Bpv-1%2Bu-euyj5p7zoibdt2of9g7h%2Bv-l6iqhl7ykytspazk3wy9.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-cap-white-unisex_ss5_p-203721307%2Bpv-1%2Bu-euyj5p7zoibdt2of9g7h%2Bv-l6iqhl7ykytspazk3wy9.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "cadillac-logo-tshirt-white",
    name: "Cadillac Tommy Hilfiger Logo T-Shirt - White",
    category: "Shirts",
    team: "Cadillac",
    driver: "Teamwear",
    price: 5490,
    stock: 20,
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL"],
    description: "Cadillac F1 logo tee in white.",
    details: "Crew neck with Tommy Hilfiger branding.",
    image:
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-t-shirt-white_ss5_p-203721312%2Bpv-1%2Bu-n0povhm4eycp6qdt3rog%2Bv-vub6bl0apdz8sccclxxt.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-t-shirt-white_ss5_p-203721312%2Bpv-1%2Bu-n0povhm4eycp6qdt3rog%2Bv-vub6bl0apdz8sccclxxt.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "cadillac-logo-polo-black",
    name: "Cadillac Tommy Hilfiger Logo Polo - Black",
    category: "Shirts",
    team: "Cadillac",
    driver: "Teamwear",
    price: 7990,
    stock: 16,
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL"],
    description: "Cadillac F1 logo polo with contrast trim.",
    details: "Classic polo silhouette with team branding.",
    image:
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-polo-black_ss5_p-203721333%2Bpv-1%2Bu-xrxsom8fzluzo5519y66%2Bv-vlgfwdfsmcm41cbrlpq7.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/cadillac-f1-team/cadillac-tommy-hilfiger-logo-polo-black_ss5_p-203721333%2Bpv-1%2Bu-xrxsom8fzluzo5519y66%2Bv-vlgfwdfsmcm41cbrlpq7.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "cadillac-2026-sergio-perez-cap-black",
    name: "Cadillac Tommy Hilfiger 2026 Sergio Perez Team Cap - Black",
    category: "Caps",
    team: "Cadillac",
    driver: "Sergio Perez",
    price: 3290,
    stock: 18,
    sizes: ["One Size"],
    description: "Driver cap for Sergio Perez 2026 Cadillac teamwear.",
    details: "Structured fit with embroidered driver number.",
    image:
      "https://f1store.formula1.com/content/ws/all/bcf8e940-60fc-47b0-8295-63897a33f9ca__2000X2000.png?w=570",
    images: [
      "https://f1store.formula1.com/content/ws/all/bcf8e940-60fc-47b0-8295-63897a33f9ca__2000X2000.png?w=570",
    ],
  },
  {
    id: "alpine-2023-team-tshirt",
    name: "Alpine F1 2023 Team T-Shirt",
    category: "Shirts",
    team: "Alpine",
    driver: "Teamwear",
    price: 4890,
    stock: 18,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official 2023 Alpine F1 team t-shirt.",
    details: "Team and sponsor branding with side panel detailing.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5a12327a/images/large/701226077001_pp_01_alpinef1team.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5a12327a/images/large/701226077001_pp_01_alpinef1team.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "alpine-2025-team-cap-9seventy",
    name: "Alpine F1 2025 Team Cap - New Era 9SEVENTY",
    category: "Caps",
    team: "Alpine",
    driver: "Teamwear",
    price: 2990,
    stock: 24,
    sizes: ["One Size"],
    description: "Official 2025 Alpine F1 team cap.",
    details: "New Era 9SEVENTY cap with team branding.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw9d495e9a/images/large/701236999001_pp_01_alpinenewera.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw9d495e9a/images/large/701236999001_pp_01_alpinenewera.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "alpine-2024-team-cap-9forty",
    name: "Alpine F1 2024 Team Cap - New Era 9FORTY",
    category: "Caps",
    team: "Alpine",
    driver: "Teamwear",
    price: 2690,
    stock: 22,
    sizes: ["One Size"],
    description: "Official 2024 Alpine F1 team cap.",
    details: "New Era 9FORTY cap with embroidered team logo.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwef69564f/images/large/701231121001_pp_01_alpinef1team.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwef69564f/images/large/701231121001_pp_01_alpinef1team.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "alpine-castore-full-zip-hoodie-lapis",
    name: "Alpine F1 Team Full Zip Hoodie - Lapis Blue",
    category: "Jackets",
    team: "Alpine",
    driver: "Teamwear",
    price: 8990,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    description: "Official Alpine F1 team full zip hoodie.",
    details: "Replica teamwear with sponsor branding.",
    image:
      "https://castore.com/cdn/shop/files/TU10293-030-LAPISBLUE-01_a614cb07-59b0-4dfc-8024-0d921d3f5933.jpg?v=1738926806",
    images: [
      "https://castore.com/cdn/shop/files/TU10293-030-LAPISBLUE-01_a614cb07-59b0-4dfc-8024-0d921d3f5933.jpg?v=1738926806",
    ],
  },
  {
    id: "alpine-castore-mens-set-up-tshirt-navy",
    name: "Alpine F1 Team Set Up T-Shirt - Navy",
    category: "Shirts",
    team: "Alpine",
    driver: "Teamwear",
    price: 4590,
    stock: 20,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    description: "Official Alpine F1 team set up t-shirt.",
    details: "Replica teamwear with sponsor branding.",
    image:
      "https://castore.com/cdn/shop/files/TM10291-020-DARKSAPPHIRE-01_3049c416-b2cd-4516-ba8a-01da3a800ae5.jpg?v=1738926648",
    images: [
      "https://castore.com/cdn/shop/files/TM10291-020-DARKSAPPHIRE-01_3049c416-b2cd-4516-ba8a-01da3a800ae5.jpg?v=1738926648",
    ],
  },
  {
    id: "mclaren-2025-lando-norris-driver-tee",
    name: "McLaren 2025 Lando Norris Driver T-Shirt",
    category: "Shirts",
    team: "McLaren",
    driver: "Lando Norris",
    price: 7490,
    stock: 18,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official 2025 Lando Norris driver t-shirt in papaya.",
    details: "Driver number 4 print with team sponsor branding.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw421f5419/images/large/701235603001_pp_01_mclaren.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw421f5419/images/large/701235603001_pp_01_mclaren.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "mclaren-2025-lando-norris-driver-cap",
    name: "McLaren 2025 Lando Norris Driver Cap",
    category: "Caps",
    team: "McLaren",
    driver: "Lando Norris",
    price: 3490,
    stock: 24,
    sizes: ["One Size"],
    description: "New Era 9SEVENTY driver cap for Lando Norris.",
    details: "Performance stretch cap with Norris detailing.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw453cd6b7/images/large/701237779001_pp_01_mclarennewera.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw453cd6b7/images/large/701237779001_pp_01_mclarennewera.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "mclaren-lando-norris-core-hoodie",
    name: "McLaren Lando Norris Core Hoodie",
    category: "Jackets",
    team: "McLaren",
    driver: "Lando Norris",
    price: 6990,
    stock: 14,
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    description: "Core hoodie with LN4 graphics.",
    details: "Regular fit hoodie with kangaroo pocket.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwc0ea01f5/images/large/701224575001_pp_01_mclaren.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwc0ea01f5/images/large/701224575001_pp_01_mclaren.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "mclaren-2021-lando-norris-9fifty-cap",
    name: "McLaren 2021 Lando Norris 9FIFTY Cap",
    category: "Caps",
    team: "McLaren",
    driver: "Lando Norris",
    price: 2990,
    stock: 20,
    sizes: ["One Size"],
    description: "Official 2021 Lando Norris driver cap.",
    details: "New Era 9FIFTY with Norris number 4.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw13d4981b/images/large/701213211002_pp_01_mclaren-f1-team.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw13d4981b/images/large/701213211002_pp_01_mclaren-f1-team.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "oscar-piastri-81-tshirt",
    name: "Piastri 81 T-Shirt",
    category: "Shirts",
    team: "McLaren",
    driver: "Oscar Piastri",
    price: 4890,
    stock: 18,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official Oscar Piastri 81 t-shirt.",
    details: "Race number and signature graphics.",
    image:
      "https://store.oscarpiastri.com/cdn/shop/files/Piastri-81-T-Shirt-front.jpg?v=1708625986&width=1400",
    images: [
      "https://store.oscarpiastri.com/cdn/shop/files/Piastri-81-T-Shirt-front.jpg?v=1708625986&width=1400",
    ],
  },
  {
    id: "oscar-piastri-signature-cap",
    name: "Signature Cap - Navy",
    category: "Caps",
    team: "McLaren",
    driver: "Oscar Piastri",
    price: 2990,
    stock: 22,
    sizes: ["One Size"],
    description: "Official OP81 signature cap in navy.",
    details: "OP logo and race number 81 patches.",
    image:
      "https://store.oscarpiastri.com/cdn/shop/files/cap-front_614c57fb-0055-4732-8ebb-9f768e147ec2.jpg?v=1744965573&width=1400",
    images: [
      "https://store.oscarpiastri.com/cdn/shop/files/cap-front_614c57fb-0055-4732-8ebb-9f768e147ec2.jpg?v=1744965573&width=1400",
    ],
  },
  {
    id: "mclaren-2025-oscar-piastri-driver-cap",
    name: "McLaren 2025 Oscar Piastri Driver Cap",
    category: "Caps",
    team: "McLaren",
    driver: "Oscar Piastri",
    price: 3490,
    stock: 24,
    sizes: ["One Size"],
    description: "New Era 9SEVENTY driver cap for Oscar Piastri.",
    details: "Performance stretch cap with Piastri detailing.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5a928dde/images/large/701236927001_pp_01_mclarennewera.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5a928dde/images/large/701236927001_pp_01_mclarennewera.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "mclaren-oscar-piastri-hoodie",
    name: "McLaren Oscar Piastri Hoodie",
    category: "Jackets",
    team: "McLaren",
    driver: "Oscar Piastri",
    price: 6990,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Oscar Piastri fan hoodie with driver branding.",
    details: "Kangaroo pocket and team logo graphics.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwfd1d3b75/images/large/701231462002_pp_02_mclaren.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwfd1d3b75/images/large/701231462002_pp_02_mclaren.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "williams-puma-logo-tee-navy",
    name: "Williams Racing PUMA Logo T-Shirt - Navy",
    category: "Shirts",
    team: "Williams",
    driver: "Teamwear",
    price: 3890,
    stock: 24,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Classic Williams Racing logo tee in navy.",
    details: "Official team branding with a regular fit.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw3eabd753/images/large/701229640001_pp_01_WilliamsRacingF1.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw3eabd753/images/large/701229640001_pp_01_WilliamsRacingF1.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "williams-puma-hoodie-navy",
    name: "Williams Racing PUMA Hoodie - Navy",
    category: "Jackets",
    team: "Williams",
    driver: "Teamwear",
    price: 6790,
    stock: 16,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Classic Williams Racing hoodie with team logo.",
    details: "Soft fleece with hood and front pocket.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwb7e853ce/images/large/701227487002_pp_01_WilliamsRacingF1.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dwb7e853ce/images/large/701227487002_pp_01_WilliamsRacingF1.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "williams-puma-pitlane-jacket-blue",
    name: "Williams Racing PUMA Pitlane Jacket - Blue",
    category: "Jackets",
    team: "Williams",
    driver: "Teamwear",
    price: 7990,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Retro-inspired pitlane jacket in Williams blue.",
    details: "Nylon shell with team branding and piping.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw56a53d8a/images/large/701231842001_pp_01_pumawilliams.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw56a53d8a/images/large/701231842001_pp_01_pumawilliams.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "williams-puma-w-cap-navy",
    name: "Williams Racing PUMA W Cap - Navy",
    category: "Caps",
    team: "Williams",
    driver: "Teamwear",
    price: 2190,
    stock: 30,
    sizes: ["One Size"],
    description: "Williams Racing W logo cap in navy.",
    details: "Adjustable snapback with embroidered crest.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw943ceb01/images/large/701227498001_pp_01_WilliamsRacingF1.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw943ceb01/images/large/701227498001_pp_01_WilliamsRacingF1.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "aston-martin-graphic-hoodie-black",
    name: "Aston Martin F1 Team Graphic Hoodie - Black",
    category: "Jackets",
    team: "Aston Martin",
    driver: "Teamwear",
    price: 7990,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    description: "Graphic hoodie with Aston Martin F1 wordmark.",
    details: "Relaxed fit with rear graphic print.",
    image:
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw044d7113/images/large/701232501001_pp_01_astonmartin.jpg?sh=800&sm=fit&sw=800",
    images: [
      "https://www.fuelforfans.com/dw/image/v2/BDWJ_PRD/on/demandware.static/-/Sites-master-catalog/default/dw044d7113/images/large/701232501001_pp_01_astonmartin.jpg?sh=800&sm=fit&sw=800",
    ],
  },
  {
    id: "aston-martin-2026-team-tshirt",
    name: "Aston Martin F1 2026 Team T-Shirt",
    category: "Shirts",
    team: "Aston Martin",
    driver: "Teamwear",
    price: 8990,
    stock: 16,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official Aston Martin F1 2026 team replica tee.",
    details: "Team and sponsor branding with performance fit.",
    image:
      "https://images.footballfanatics.com/aston-martin/aston-martin-f1-aramco-cognizant-f1-2026-team-t-shirt_ss5_p-203336997+pv-1+u-fyrnnxhum4ruyb0ovqts+v-q9z9nflkfl4aubdmurrr.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/aston-martin/aston-martin-f1-aramco-cognizant-f1-2026-team-t-shirt_ss5_p-203336997+pv-1+u-fyrnnxhum4ruyb0ovqts+v-q9z9nflkfl4aubdmurrr.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "aston-martin-2025-team-driver-hoodie",
    name: "Aston Martin F1 2025 Team Driver Hoodie",
    category: "Jackets",
    team: "Aston Martin",
    driver: "Teamwear",
    price: 10990,
    stock: 10,
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official 2025 Aston Martin team driver hoodie.",
    details: "Replica teamwear with sponsor branding.",
    image:
      "https://images.footballfanatics.com/aston-martin/aston-martin-aramco-cognizant-f1-2025-team-driver-hoodie_ss5_p-202359055+pv-1+u-spuryzpjhhbcakfhzgyf+v-snx4o365sp3vfckfxtww.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/aston-martin/aston-martin-aramco-cognizant-f1-2025-team-driver-hoodie_ss5_p-202359055+pv-1+u-spuryzpjhhbcakfhzgyf+v-snx4o365sp3vfckfxtww.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "aston-martin-2024-team-driver-hoodie",
    name: "Aston Martin F1 2024 Team Driver Hoodie",
    category: "Jackets",
    team: "Aston Martin",
    driver: "Teamwear",
    price: 9990,
    stock: 10,
    sizes: ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"],
    description: "Official 2024 Aston Martin team driver hoodie.",
    details: "Replica teamwear with sponsor graphics.",
    image:
      "https://images.footballfanatics.com/aston-martin/aston-martin-aramco-f1-2024-team-driver-hoodie_ss5_p-200838313+pv-1+u-jqcrgxpgi6vrftk2vfr0+v-6xel5z5tet4h9ksg7fw8.jpg?_hv=2&w=1018",
    images: [
      "https://images.footballfanatics.com/aston-martin/aston-martin-aramco-f1-2024-team-driver-hoodie_ss5_p-200838313+pv-1+u-jqcrgxpgi6vrftk2vfr0+v-6xel5z5tet4h9ksg7fw8.jpg?_hv=2&w=1018",
    ],
  },
  {
    id: "aston-martin-2025-team-cap-black",
    name: "Aston Martin F1 2025 Team Cap - Black",
    category: "Caps",
    team: "Aston Martin",
    driver: "Teamwear",
    price: 2990,
    stock: 28,
    sizes: ["One Size"],
    description: "Official 2025 Aston Martin team cap in black.",
    details: "Structured fit with curved bill and team crest.",
    image:
      "https://images.footballfanatics.com/aston-martin/aston-martin-aramco-cognizant-f1-2025-team-cap-black_ss5_p-202359042+pv-1+u-mpfmaf9z4jn9uompjlaz+v-i8ahlgumme1eh4wonzob.jpg?_hv=2&w=900",
    images: [
      "https://images.footballfanatics.com/aston-martin/aston-martin-aramco-cognizant-f1-2025-team-cap-black_ss5_p-202359042+pv-1+u-mpfmaf9z4jn9uompjlaz+v-i8ahlgumme1eh4wonzob.jpg?_hv=2&w=900",
    ],
  },
  {
    id: "men-paddock-polo-black",
    name: "Men Paddock Polo - Black",
    category: "Men",
    team: "Formula 1",
    driver: "Teamwear",
    price: 4290,
    stock: 28,
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    description: "Classic men's paddock polo with tonal branding.",
    details: "Moisture-wicking fabric, three-button placket.",
    image: createProductImage("Men Polo", "#0f1115", "#ff1e1e"),
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1521579971123-119293fd7d30?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "men-grid-hoodie-charcoal",
    name: "Men Grid Hoodie - Charcoal",
    category: "Men",
    team: "Red Bull",
    driver: "Teamwear",
    price: 5890,
    stock: 20,
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Soft fleece hoodie with bold gridline print.",
    details: "Brushed interior, ribbed cuffs, kangaroo pocket.",
    image: createProductImage("Men Hoodie", "#1a1a1a", "#ffd100"),
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1521579971123-119293fd7d30?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "men-team-crewneck-sweat",
    name: "Men Team Crewneck Sweat",
    category: "Men",
    team: "Mercedes",
    driver: "Teamwear",
    price: 5390,
    stock: 18,
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Crewneck sweat with understated team crest.",
    details: "Midweight fleece, reinforced collar, soft hand feel.",
    image: createProductImage("Crewneck", "#101820", "#00d2be"),
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1521579971123-119293fd7d30?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "men-performance-track-shorts",
    name: "Men Performance Track Shorts",
    category: "Men",
    team: "McLaren",
    driver: "Teamwear",
    price: 3590,
    stock: 24,
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Lightweight track shorts for race-day comfort.",
    details: "Quick-dry fabric, zip pockets, drawcord waist.",
    image: createProductImage("Track Shorts", "#1f130b", "#ff8a00"),
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1521579971123-119293fd7d30?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "men-race-day-shell-jacket",
    name: "Men Race Day Shell Jacket",
    category: "Men",
    team: "Ferrari",
    driver: "Teamwear",
    price: 7890,
    stock: 12,
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Weather-ready shell jacket with race detailing.",
    details: "Packable hood, taped seams, adjustable cuffs.",
    image: createProductImage("Shell Jacket", "#2b0a0a", "#ff4d4d"),
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1521579971123-119293fd7d30?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "women-sleeveless-polo-sky",
    name: "Women Sleeveless Polo - Sky",
    category: "Women",
    team: "Williams",
    driver: "Teamwear",
    price: 3690,
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Sleeveless polo with clean paddock styling.",
    details: "Light stretch fabric, taped placket, breathable weave.",
    image: createProductImage("Women Polo", "#d9ecff", "#3b82f6"),
    images: [
      "https://images.unsplash.com/photo-1508853363419-a9263d752c59?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1565012355505-9cefe58e4fd3?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
      "https://images.unsplash.com/photo-1615957500739-f68f9d53525a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "kids-race-day-backpack",
    name: "Kids Race Day Backpack",
    category: "Kids",
    team: "Formula 1",
    driver: "Teamwear",
    price: 2590,
    stock: 24,
    sizes: ["One Size"],
    description: "Compact backpack for young fans on the go.",
    details: "Padded straps, front organizer pocket, durable canvas.",
    image: createProductImage("Kids Pack", "#202b2f", "#ffb703"),
    images: [
      "https://images.unsplash.com/photo-1558140275-6b7b7bf2cfa1?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1566845983206-173d95ecc597?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1583249483442-c665ed9c21da?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "headwear-trackside-beanie",
    name: "Trackside Beanie",
    category: "Headwear",
    team: "Mercedes",
    driver: "Teamwear",
    price: 1890,
    stock: 22,
    sizes: ["One Size"],
    description: "Rib-knit beanie for cool race mornings.",
    details: "Fold-over cuff, soft yarn, tonal crest.",
    image: createProductImage("Beanie", "#11161c", "#00d2be"),
    images: [
      "https://images.unsplash.com/photo-1723797447445-a7a81aa8078a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1510681217935-5bc73636d974?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "headwear-classic-visor",
    name: "Classic Track Visor",
    category: "Headwear",
    team: "Ferrari",
    driver: "Teamwear",
    price: 1690,
    stock: 20,
    sizes: ["One Size"],
    description: "Lightweight visor for sunny grandstands.",
    details: "Curved brim, moisture-wicking band, adjustable strap.",
    image: createProductImage("Track Visor", "#7a0000", "#ffcc5c"),
    images: [
      "https://images.unsplash.com/photo-1723797447445-a7a81aa8078a?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1510681217935-5bc73636d974?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "accessory-trackside-travel-mug",
    name: "Trackside Travel Mug",
    category: "Accessories",
    team: "Formula 1",
    driver: "Teamwear",
    price: 1490,
    stock: 34,
    sizes: ["One Size"],
    description: "Insulated travel mug for early starts.",
    details: "Double-wall steel, flip lid, fits standard cupholders.",
    image: createProductImage("Travel Mug", "#1a1f2b", "#ff4d4d"),
    images: [
      "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    ],
  },
  {
    id: "collectible-gridone-keychain",
    name: "GridOne Metal Keychain",
    category: "Collectibles",
    team: "Formula 1",
    driver: "Teamwear",
    price: 790,
    stock: 40,
    sizes: ["One Size"],
    description: "Metal keychain with GridOne badge.",
    details: "Brushed finish, enamel inlay, sturdy ring.",
    image: createProductImage("Keychain", "#121620", "#ffb703"),
    images: [
      "https://images.unsplash.com/photo-1511415518647-9e5da4fd803f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1667463439450-7d85f50426ea?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      "https://images.unsplash.com/photo-1511453650475-ca175d4aede0?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
    ],
  },
];

const AUTO_PRODUCT_IMAGE_SETS = {
  Accessories: [
    "https://images.unsplash.com/photo-1760624294699-3d3156314391?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    "https://images.unsplash.com/photo-1618677366787-9727aacca7ea?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    "https://images.unsplash.com/flagged/photo-1557599365-977bd4eecc4d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
  ],
  Collectibles: [
    "https://images.unsplash.com/photo-1511415518647-9e5da4fd803f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    "https://images.unsplash.com/photo-1667463439450-7d85f50426ea?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    "https://images.unsplash.com/photo-1511453650475-ca175d4aede0?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=60&w=3000",
  ],
};

const AUTO_PRODUCT_PALETTES = [
  ["#1a1f2b", "#ff4d4d"],
  ["#0f1115", "#ffd100"],
  ["#101820", "#00d2be"],
  ["#20160c", "#ff8a00"],
  ["#2b0a0a", "#ff6b6b"],
];

const normalizeStoreValue = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeProductName = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const isSvgPlaceholder = (value) => String(value || "").startsWith("data:image/svg+xml");
const OFFICIAL_STORE_IMAGE_HOSTS = ["f1store.formula1.com", "images.footballfanatics.com"];

const isOfficialStoreImage = (value) => {
  const url = String(value || "");
  if (!url) return false;
  return OFFICIAL_STORE_IMAGE_HOSTS.some((host) => url.includes(host));
};

const hasOfficialStoreImage = (product) => {
  if (!product) return false;
  if (isOfficialStoreImage(product.image)) return true;
  const images = Array.isArray(product.images) ? product.images : [];
  return images.some(isOfficialStoreImage);
};

const dedupeByName = (items) => {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).filter((item) => {
    const key = normalizeStoreValue(item?.name);
    if (!key) {
      return false;
    }
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const dedupeStoreProducts = (items) => dedupeByName(items);

const resolveTeamFromText = (value) => {
  const text = normalizeStoreValue(value);
  if (!text) {
    return "";
  }

  if (text.includes("red bull") || text.includes("oracle red bull")) {
    return TEAM_ID_TO_STORE_NAME.red_bull;
  }
  if (text.includes("ferrari") || text.includes("scuderia")) {
    return TEAM_ID_TO_STORE_NAME.ferrari;
  }
  if (text.includes("mercedes") || text.includes("amg") || text.includes("petronas")) {
    return TEAM_ID_TO_STORE_NAME.mercedes;
  }
  if (text.includes("mclaren")) {
    return TEAM_ID_TO_STORE_NAME.mclaren;
  }
  if (text.includes("aston martin") || text.includes("aramco") || text.includes("cognizant")) {
    return TEAM_ID_TO_STORE_NAME.aston_martin;
  }
  if (text.includes("williams")) {
    return TEAM_ID_TO_STORE_NAME.williams;
  }
  if (text.includes("audi")) {
    return TEAM_ID_TO_STORE_NAME.audi;
  }
  if (text.includes("haas")) {
    return TEAM_ID_TO_STORE_NAME.haas;
  }
  if (text.includes("alpine")) {
    return TEAM_ID_TO_STORE_NAME.alpine;
  }
  if (text.includes("cadillac")) {
    return TEAM_ID_TO_STORE_NAME.cadillac;
  }
  if (
    text.includes("racing bulls") ||
    text.includes("visa cash app") ||
    /\brb\b/.test(text)
  ) {
    return TEAM_ID_TO_STORE_NAME.rb;
  }
  if (text.includes("kick sauber") || text.includes("sauber") || text.includes("alfa romeo")) {
    return TEAM_ID_TO_STORE_NAME.audi;
  }

  return "";
};

const normalizeStoreCategory = (value) => {
  const raw = normalizeStoreValue(value);
  if (!raw) {
    return "Collectibles";
  }
  if (raw === "men" || raw === "shirts" || raw === "jackets") {
    return "Men";
  }
  if (raw === "women") {
    return "Women";
  }
  if (raw === "kids") {
    return "Kids";
  }
  if (raw === "headwear" || raw === "caps") {
    return "Headwear";
  }
  if (raw === "accessories" || raw === "gifts & accessories") {
    return "Accessories";
  }
  if (raw === "collectibles") {
    return "Collectibles";
  }
  return "Collectibles";
};

const resolveStoreTeam = (product) => {
  const rawTeam = String(product?.team || "").trim();
  const normalizedTeam = normalizeStoreValue(rawTeam);
  if (normalizedTeam) {
    const match = STORE_TEAMS.find(
      (team) => normalizeStoreValue(team) === normalizedTeam && team !== "All Teams"
    );
    if (match) {
      return match;
    }
  }

  const driverTeam = DRIVER_TEAM_MAP[product?.driver];
  if (driverTeam) {
    return driverTeam;
  }

  const nameMatch = resolveTeamFromText(product?.name);
  if (nameMatch) {
    return nameMatch;
  }

  return "All Teams";
};

const ensureMinimumStoreProducts = (sourceProducts, { teams, drivers, minPer }) => {
  const products = Array.isArray(sourceProducts) ? [...sourceProducts] : [];
  const teamCounts = new Map();
  const driverCounts = new Map();

  products.forEach((product) => {
    if (product?.team && teams.includes(product.team)) {
      teamCounts.set(product.team, (teamCounts.get(product.team) || 0) + 1);
    }
    if (product?.driver && drivers.includes(product.driver)) {
      driverCounts.set(product.driver, (driverCounts.get(product.driver) || 0) + 1);
    }
  });

  const buildAutoProduct = ({
    idPrefix,
    namePrefix,
    category,
    team,
    driver,
    index,
  }) => {
    const palette = AUTO_PRODUCT_PALETTES[index % AUTO_PRODUCT_PALETTES.length];
    const title = `${namePrefix} ${index + 1}`;
    const image = createProductImage(title, palette[0], palette[1]);
    const images = AUTO_PRODUCT_IMAGE_SETS[category] || [image];
    return {
      id: `${idPrefix}-${index + 1}`,
      name: `${namePrefix} ${index + 1}`,
      category,
      team,
      driver,
      price: 1490 + index * 210,
      stock: 18 + (index % 5) * 4,
      sizes: ["One Size"],
      description: "Auto-generated item to complete the catalog.",
      details: "Limited run with premium finish.",
      image,
      images,
    };
  };

  teams.forEach((team) => {
    const current = teamCounts.get(team) || 0;
    const needed = Math.max(0, minPer - current);
    for (let i = 0; i < needed; i += 1) {
      const slug = toSlug(team);
      products.push(
        buildAutoProduct({
          idPrefix: `auto-team-${slug}`,
          namePrefix: `${team} Team Essentials`,
          category: "Accessories",
          team,
          driver: "Teamwear",
          index: i,
        })
      );
    }
  });

  drivers.forEach((driver) => {
    const current = driverCounts.get(driver) || 0;
    const needed = Math.max(0, minPer - current);
    for (let i = 0; i < needed; i += 1) {
      const slug = toSlug(driver);
      const driverTeam = DRIVER_TEAM_MAP[driver] || "All Teams";
      products.push(
        buildAutoProduct({
          idPrefix: `auto-driver-${slug}`,
          namePrefix: `${driver} Fan Collectible`,
          category: "Collectibles",
          team: driverTeam,
          driver,
          index: i,
        })
      );
    }
  });

  return products;
};

const SEEDED_STORE_PRODUCTS = ensureMinimumStoreProducts(RAW_STORE_PRODUCTS, {
  teams: STORE_TEAMS.filter((team) => team !== "All Teams"),
  drivers: STORE_DRIVERS.filter((driver) => driver !== "All Drivers"),
  minPer: 0,
});

const TEAM_PRODUCT_PAIRS = {
  McLaren: [
    { name: "McLaren 2022 New Era M Logo 9Forty Cap", category: "Caps" },
    { name: "McLaren Essential Logo Hoodie - Smoke Green", category: "Jackets" },
  ],
  "Red Bull": [
    { name: "Oracle Red Bull Racing New Era 9FIFTY Cap", category: "Caps" },
    { name: "Red Bull Racing 2025 Team Polo", category: "Shirts" },
  ],
  Ferrari: [
    { name: "Scuderia Ferrari 2025 Pinstripe Team Cap", category: "Caps" },
    { name: "Scuderia Ferrari 2023 Team Charles Leclerc T-Shirt", category: "Shirts" },
  ],
  Mercedes: [
    { name: "Mercedes AMG Petronas adidas F1 2025 Team Cap - White", category: "Caps" },
    { name: "Mercedes AMG Petronas adidas F1 Logo Zip Hoodie - Black", category: "Jackets" },
  ],
  Williams: [
    { name: "Williams Racing 2024 Team T-Shirt - White", category: "Shirts" },
    { name: "Williams Racing New Era Carlos Sainz Replica Tech T-Shirt - Navy", category: "Shirts" },
  ],
  "Aston Martin": [
    { name: "Aston Martin Aramco Cognizant F1 2026 Team Cap - Black", category: "Caps" },
    { name: "Aston Martin Aramco Cognizant F1 2023 Official Team T-Shirt", category: "Shirts" },
  ],
  Audi: [
    { name: "Audi F1 2026 Replica Team T-Shirt", category: "Shirts" },
    { name: "Audi F1 2026 Nico Hulkenberg Driver Cap", category: "Caps" },
  ],
  "Racing Bulls": [
    { name: "VCARB New Era 9FORTY Team Cap", category: "Caps" },
    { name: "VCARB Hugo Fanwear Hoodie - Black", category: "Jackets" },
  ],
  Haas: [
    { name: "Haas F1 Team New Era 9SEVENTY 200th Race Special Edition Cap", category: "Caps" },
    { name: "Haas F1 Moneygram 2024 Team-T-Shirt", category: "Shirts" },
  ],
  Alpine: [
    { name: "BWT Alpine F1 Team 2022 Kimoa Fernando Alonso Flatbrim Cap", category: "Caps" },
    { name: "BWT Alpine F1 Team 2022 T-Shirt - Blue", category: "Shirts" },
  ],
  Cadillac: [
    { name: "Cadillac Tommy Hilfiger 2026 Sergio Perez Team Cap - Black", category: "Caps" },
    { name: "Cadillac Tommy Hilfiger Team Hoodie - Unisex", category: "Jackets" },
  ],
};

const DRIVER_PRODUCT_PAIRS = {
  "Lando Norris": [
    { name: "McLaren Lando Norris Driver T-Shirt - White - Unisex", category: "Shirts" },
    { name: "McLaren 2022 New Era M Logo 9Forty Cap", category: "Caps" },
  ],
  "Max Verstappen": [
    { name: "Red Bull Racing 2024 Max Verstappen F1 World Drivers' Champion Poster", category: "Collectibles" },
    { name: "Red Bull Racing 2025 Team Max Verstappen Driver T-Shirt", category: "Shirts" },
  ],
  "Charles Leclerc": [
    { name: "Scuderia Ferrari 2026 Charles Leclerc Special Edition Shanghai GP Cap - Red", category: "Caps" },
    { name: "Scuderia Ferrari Charles Leclerc T-Shirt – Unisex", category: "Shirts" },
  ],
  "Lewis Hamilton": [
    { name: "Scuderia Ferrari Lewis Hamilton 2025 Silverstone Special Edition Cap", category: "Caps" },
    { name: "Scuderia Ferrari 2025 Pinstripe Team Cap", category: "Caps" },
  ],
  "Carlos Sainz": [
    { name: "Williams Racing New Era Carlos Sainz Replica Tech T-Shirt - Navy", category: "Shirts" },
    { name: "Williams Racing 2024 Team T-Shirt - White", category: "Shirts" },
  ],
  "Liam Lawson": [
    { name: "VCARB New Era 9FORTY Team Cap", category: "Caps" },
    { name: "VCARB Hugo Fanwear Hoodie - Black", category: "Jackets" },
  ],
  "Nico Hulkenberg": [
    { name: "Audi F1 2026 Nico Hulkenberg Driver Cap", category: "Caps" },
    { name: "Audi F1 2026 Replica Team T-Shirt", category: "Shirts" },
  ],
  "Arvid Lindblad": [
    { name: "VCARB New Era 9FORTY Team Cap", category: "Caps" },
    { name: "VCARB Hugo Fanwear Hoodie - Black", category: "Jackets" },
  ],
  "Sergio Perez": [
    { name: "Cadillac Tommy Hilfiger 2026 Sergio Perez Team Cap - Black", category: "Caps" },
    { name: "Cadillac Tommy Hilfiger Team Hoodie - Unisex", category: "Jackets" },
  ],
};

const RACING_BULLS_DRIVER_PRODUCTS = {
  "Liam Lawson": ["vcarb-2026-team-tshirt", "vcarb-2024-team-full-zip-hoodie"],
  "Arvid Lindblad": ["vcarb-2024-team-quarter-zip", "vcarb-fanwear-hoodie-black"],
};

const resolveRacingBullsDriver = (product) => {
  if (!product || product.team !== "Racing Bulls") {
    return product?.driver || "";
  }
  if (product.driver && product.driver !== "Teamwear") {
    return product.driver;
  }

  const id = String(product.id || "");
  for (const [driver, ids] of Object.entries(RACING_BULLS_DRIVER_PRODUCTS)) {
    if (ids.includes(id)) {
      return driver;
    }
  }

  return product.driver || "Teamwear";
};

export const applyDriverProductOverride = (product) => {
  if (!product) {
    return product;
  }
  const name = String(product.name || "");
  if (!name.toLowerCase().includes("fan collectible")) {
    return product;
  }
  const match = name.match(/(\d+)\s*$/);
  const index = match ? Number(match[1]) - 1 : 0;
  const driverPair = DRIVER_PRODUCT_PAIRS[product.driver];
  const team = DRIVER_TEAM_MAP[product.driver] || resolveStoreTeam(product);
  const pair = driverPair || TEAM_PRODUCT_PAIRS[team];
  if (!pair || pair.length === 0) {
    return product;
  }
  const override = pair[Math.abs(index) % pair.length];
  return {
    ...product,
    name: override.name,
    category: override.category,
  };
};

export const STORE_PRODUCTS = dedupeByName(SEEDED_STORE_PRODUCTS.map((product) => {
  const baseImages = Array.isArray(product.images) ? product.images : [];
  const images = baseImages.length > 0 ? baseImages : product.image ? [product.image] : [];
  const normalizedCategory = normalizeStoreCategory(product.category);
  const normalizedName = normalizeProductName(product.name);
  const normalizedTeam = resolveStoreTeam({ ...product, category: normalizedCategory });
  const withOverrides = applyDriverProductOverride({
    ...product,
    name: normalizedName,
    category: normalizedCategory,
  });
  const resolvedDriver = resolveRacingBullsDriver(withOverrides);
  return {
    ...product,
    name: withOverrides.name,
    category: withOverrides.category,
    team: normalizedTeam,
    driver: resolvedDriver,
    images,
  };
}));

export const ORDER_FLOW = ["To Pack", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export const DELIVERY_FLOW = ["Warehouse", "Linehaul", "Hub Transit", "Last-mile", "Delivered"];
