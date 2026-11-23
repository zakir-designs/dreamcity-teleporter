import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cscPkg from 'country-state-city';
import * as indiaPkg from 'india-state-district';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const StateAPI = cscPkg.State || cscPkg.default?.State;
const getAllIndiaStatesFn = indiaPkg.getAllStates || indiaPkg.default?.getAllStates;
const getIndiaDistrictsFn = indiaPkg.getDistricts || indiaPkg.default?.getDistricts;

// 19 G20 Countries + UAE (Dubai) + Singapore = 21 Countries
const COUNTRIES = {
  IN: {
    code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹',
    tagline: 'Global Tech & Engineering Powerhouse',
    avgTechSalary: 55000, effectiveTaxRate: 0.09, hasDistricts: true,
    basket: { rent: 16000, food: 9000, transport: 2500, utilities: 3000, lifestyle: 5500 },
    tierScale: {
      student: { rent: 0.52, food: 0.75, transport: 0.8, utilities: 0.65, lifestyle: 0.55 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.65, food: 1.35, transport: 1.4, utilities: 1.35, lifestyle: 1.75 }
    }
  },
  AE: {
    code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', symbol: 'AED ',
    tagline: '0% Income Tax Global Hub',
    avgTechSalary: 15000, effectiveTaxRate: 0.0, hasDistricts: false,
    basket: { rent: 5500, food: 1800, transport: 450, utilities: 750, lifestyle: 1500 },
    tierScale: {
      student: { rent: 0.62, food: 0.78, transport: 0.82, utilities: 0.65, lifestyle: 0.65 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.95, food: 1.45, transport: 1.65, utilities: 1.45, lifestyle: 1.9 }
    }
  },
  SG: {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$',
    tagline: 'Asia Fintech Powerhouse',
    avgTechSalary: 6000, effectiveTaxRate: 0.07, hasDistricts: false,
    basket: { rent: 2400, food: 800, transport: 150, utilities: 200, lifestyle: 550 },
    tierScale: {
      student: { rent: 0.55, food: 0.76, transport: 0.85, utilities: 0.72, lifestyle: 0.62 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.85, food: 1.4, transport: 1.55, utilities: 1.38, lifestyle: 1.8 }
    }
  },
  US: {
    code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$',
    tagline: 'Global Tech & Innovation Leader',
    avgTechSalary: 8200, effectiveTaxRate: 0.25, hasDistricts: false,
    basket: { rent: 2150, food: 620, transport: 150, utilities: 210, lifestyle: 470 },
    tierScale: {
      student: { rent: 0.58, food: 0.78, transport: 0.85, utilities: 0.7, lifestyle: 0.65 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.9, food: 1.42, transport: 1.55, utilities: 1.38, lifestyle: 1.85 }
    }
  },
  GB: {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£',
    tagline: 'European Finance & AI Center',
    avgTechSalary: 4200, effectiveTaxRate: 0.24, hasDistricts: false,
    basket: { rent: 1550, food: 430, transport: 165, utilities: 230, lifestyle: 365 },
    tierScale: {
      student: { rent: 0.58, food: 0.78, transport: 0.84, utilities: 0.7, lifestyle: 0.64 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.8, food: 1.38, transport: 1.48, utilities: 1.35, lifestyle: 1.75 }
    }
  },
  DE: {
    code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', symbol: '€',
    tagline: 'European Engineering & Startup Hub',
    avgTechSalary: 4600, effectiveTaxRate: 0.34, hasDistricts: false,
    basket: { rent: 1200, food: 420, transport: 60, utilities: 260, lifestyle: 310 },
    tierScale: {
      student: { rent: 0.56, food: 0.75, transport: 0.8, utilities: 0.68, lifestyle: 0.62 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.7, food: 1.35, transport: 1.4, utilities: 1.3, lifestyle: 1.7 }
    }
  },
  FR: {
    code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', symbol: '€',
    tagline: 'European AI & Aerospace Hub',
    avgTechSalary: 4200, effectiveTaxRate: 0.3, hasDistricts: false,
    basket: { rent: 1150, food: 440, transport: 85, utilities: 210, lifestyle: 320 },
    tierScale: {
      student: { rent: 0.57, food: 0.76, transport: 0.82, utilities: 0.7, lifestyle: 0.63 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.72, food: 1.38, transport: 1.42, utilities: 1.32, lifestyle: 1.75 }
    }
  },
  IT: {
    code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', symbol: '€',
    tagline: 'Design, Mobility & Industrial Hub',
    avgTechSalary: 3200, effectiveTaxRate: 0.29, hasDistricts: false,
    basket: { rent: 950, food: 380, transport: 55, utilities: 190, lifestyle: 260 },
    tierScale: {
      student: { rent: 0.56, food: 0.75, transport: 0.82, utilities: 0.68, lifestyle: 0.62 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.68, food: 1.35, transport: 1.4, utilities: 1.3, lifestyle: 1.7 }
    }
  },
  CA: {
    code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'C$',
    tagline: 'North American Tech Corridor',
    avgTechSalary: 6500, effectiveTaxRate: 0.25, hasDistricts: false,
    basket: { rent: 2050, food: 590, transport: 155, utilities: 205, lifestyle: 370 },
    tierScale: {
      student: { rent: 0.57, food: 0.77, transport: 0.82, utilities: 0.7, lifestyle: 0.63 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.78, food: 1.36, transport: 1.45, utilities: 1.35, lifestyle: 1.75 }
    }
  },
  AU: {
    code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: 'A$',
    tagline: 'Asia-Pacific Tech & Quality of Life',
    avgTechSalary: 7400, effectiveTaxRate: 0.26, hasDistricts: false,
    basket: { rent: 2250, food: 650, transport: 185, utilities: 230, lifestyle: 420 },
    tierScale: {
      student: { rent: 0.56, food: 0.76, transport: 0.82, utilities: 0.7, lifestyle: 0.63 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.78, food: 1.38, transport: 1.45, utilities: 1.34, lifestyle: 1.78 }
    }
  },
  JP: {
    code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', symbol: '¥',
    tagline: 'Robotics & Precision Engineering',
    avgTechSalary: 420000, effectiveTaxRate: 0.2, hasDistricts: false,
    basket: { rent: 110000, food: 54000, transport: 15000, utilities: 20000, lifestyle: 34000 },
    tierScale: {
      student: { rent: 0.54, food: 0.76, transport: 0.84, utilities: 0.68, lifestyle: 0.6 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.76, food: 1.38, transport: 1.45, utilities: 1.32, lifestyle: 1.78 }
    }
  },
  KR: {
    code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', symbol: '₩',
    tagline: 'Semiconductor & Digital Tech Hub',
    avgTechSalary: 4300000, effectiveTaxRate: 0.18, hasDistricts: false,
    basket: { rent: 1150000, food: 550000, transport: 95000, utilities: 180000, lifestyle: 360000 },
    tierScale: {
      student: { rent: 0.56, food: 0.76, transport: 0.85, utilities: 0.7, lifestyle: 0.62 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.75, food: 1.38, transport: 1.45, utilities: 1.34, lifestyle: 1.76 }
    }
  },
  CN: {
    code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', symbol: '¥',
    tagline: 'Hardware, AI & Scale Economy',
    avgTechSalary: 18500, effectiveTaxRate: 0.16, hasDistricts: false,
    basket: { rent: 4800, food: 2200, transport: 380, utilities: 520, lifestyle: 1400 },
    tierScale: {
      student: { rent: 0.54, food: 0.75, transport: 0.82, utilities: 0.68, lifestyle: 0.6 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.78, food: 1.4, transport: 1.48, utilities: 1.35, lifestyle: 1.8 }
    }
  },
  SA: {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', symbol: 'SAR ',
    tagline: '0% Income Tax Vision 2030 Hub',
    avgTechSalary: 14000, effectiveTaxRate: 0.0, hasDistricts: false,
    basket: { rent: 3600, food: 1500, transport: 450, utilities: 550, lifestyle: 1100 },
    tierScale: {
      student: { rent: 0.58, food: 0.76, transport: 0.82, utilities: 0.68, lifestyle: 0.62 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.82, food: 1.42, transport: 1.55, utilities: 1.4, lifestyle: 1.82 }
    }
  },
  BR: {
    code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', symbol: 'R$',
    tagline: 'Latin America Tech & Fintech Hub',
    avgTechSalary: 9500, effectiveTaxRate: 0.21, hasDistricts: false,
    basket: { rent: 2700, food: 1450, transport: 320, utilities: 460, lifestyle: 820 },
    tierScale: {
      student: { rent: 0.54, food: 0.75, transport: 0.8, utilities: 0.68, lifestyle: 0.6 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.72, food: 1.36, transport: 1.45, utilities: 1.32, lifestyle: 1.75 }
    }
  },
  MX: {
    code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', symbol: 'MX$',
    tagline: 'Nearshore North America Tech Hub',
    avgTechSalary: 38000, effectiveTaxRate: 0.2, hasDistricts: false,
    basket: { rent: 12500, food: 5600, transport: 1200, utilities: 1700, lifestyle: 3200 },
    tierScale: {
      student: { rent: 0.54, food: 0.76, transport: 0.82, utilities: 0.68, lifestyle: 0.6 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.74, food: 1.38, transport: 1.45, utilities: 1.32, lifestyle: 1.75 }
    }
  },
  ID: {
    code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', symbol: 'Rp ',
    tagline: 'Southeast Asia Digital Economy',
    avgTechSalary: 14500000, effectiveTaxRate: 0.14, hasDistricts: false,
    basket: { rent: 4800000, food: 2600000, transport: 650000, utilities: 900000, lifestyle: 1650000 },
    tierScale: {
      student: { rent: 0.52, food: 0.74, transport: 0.8, utilities: 0.66, lifestyle: 0.58 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.7, food: 1.38, transport: 1.45, utilities: 1.34, lifestyle: 1.78 }
    }
  },
  ZA: {
    code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', symbol: 'R ',
    tagline: 'Africa Enterprise & Fintech Hub',
    avgTechSalary: 42000, effectiveTaxRate: 0.24, hasDistricts: false,
    basket: { rent: 11500, food: 5200, transport: 1600, utilities: 2100, lifestyle: 3100 },
    tierScale: {
      student: { rent: 0.54, food: 0.76, transport: 0.82, utilities: 0.68, lifestyle: 0.6 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.72, food: 1.36, transport: 1.45, utilities: 1.34, lifestyle: 1.75 }
    }
  },
  TR: {
    code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY', symbol: '₺',
    tagline: 'Eurasia Gaming & Software Hub',
    avgTechSalary: 68000, effectiveTaxRate: 0.22, hasDistricts: false,
    basket: { rent: 24000, food: 11500, transport: 2400, utilities: 3400, lifestyle: 6200 },
    tierScale: {
      student: { rent: 0.55, food: 0.76, transport: 0.82, utilities: 0.68, lifestyle: 0.6 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.75, food: 1.38, transport: 1.45, utilities: 1.35, lifestyle: 1.78 }
    }
  },
  AR: {
    code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS', symbol: 'ARS ',
    tagline: 'South America Remote Tech Hub',
    avgTechSalary: 2200000, effectiveTaxRate: 0.2, hasDistricts: false,
    basket: { rent: 680000, food: 380000, transport: 75000, utilities: 115000, lifestyle: 210000 },
    tierScale: {
      student: { rent: 0.54, food: 0.75, transport: 0.8, utilities: 0.68, lifestyle: 0.58 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.72, food: 1.36, transport: 1.42, utilities: 1.32, lifestyle: 1.74 }
    }
  },
  RU: {
    code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB', symbol: '₽',
    tagline: 'Systems & Engineering Economy',
    avgTechSalary: 190000, effectiveTaxRate: 0.15, hasDistricts: false,
    basket: { rent: 62000, food: 31000, transport: 5500, utilities: 9000, lifestyle: 17500 },
    tierScale: {
      student: { rent: 0.55, food: 0.76, transport: 0.82, utilities: 0.68, lifestyle: 0.6 },
      standard: { rent: 1.0, food: 1.0, transport: 1.0, utilities: 1.0, lifestyle: 1.0 },
      comfort: { rent: 1.74, food: 1.38, transport: 1.44, utilities: 1.34, lifestyle: 1.76 }
    }
  }
};

// Flagship hubs for the Instant World Map & quick-click cards
const WORLD_HUBS = [
  { id: 'hyderabad', name: 'Hyderabad', countryCode: 'IN', stateName: 'Telangana', districtName: 'Hyderabad' },
  { id: 'bengaluru', name: 'Bengaluru', countryCode: 'IN', stateName: 'Karnataka', districtName: 'Bengaluru Urban' },
  { id: 'mumbai', name: 'Mumbai', countryCode: 'IN', stateName: 'Maharashtra', districtName: 'Mumbai' },
  { id: 'dubai', name: 'Dubai', countryCode: 'AE', stateName: 'Dubai', districtName: '' },
  { id: 'singapore', name: 'Singapore', countryCode: 'SG', stateName: 'Central Singapore', districtName: '' },
  { id: 'newyork', name: 'New York', countryCode: 'US', stateName: 'New York', districtName: '' },
  { id: 'london', name: 'London', countryCode: 'GB', stateName: 'England', districtName: '' },
  { id: 'berlin', name: 'Berlin', countryCode: 'DE', stateName: 'Berlin', districtName: '' },
  { id: 'toronto', name: 'Toronto (ON)', countryCode: 'CA', stateName: 'Ontario', districtName: '' },
  { id: 'tokyo', name: 'Tokyo', countryCode: 'JP', stateName: 'Tokyo', districtName: '' }
];

// Regional cost & salary multipliers for key G20 states
const STATE_INDEX = {
  // USA
  'US:california': { cost: 1.34, salary: 1.36 },
  'US:new york': { cost: 1.32, salary: 1.28 },
  'US:massachusetts': { cost: 1.24, salary: 1.22 },
  'US:washington': { cost: 1.18, salary: 1.24 },
  'US:district of columbia': { cost: 1.28, salary: 1.22 },
  'US:hawaii': { cost: 1.32, salary: 1.04 },
  'US:new jersey': { cost: 1.16, salary: 1.14 },
  'US:texas': { cost: 0.94, salary: 1.04 },
  'US:florida': { cost: 0.98, salary: 0.95 },
  'US:illinois': { cost: 1.02, salary: 1.05 },
  'US:colorado': { cost: 1.06, salary: 1.08 },
  'US:virginia': { cost: 1.04, salary: 1.08 },
  'US:ohio': { cost: 0.82, salary: 0.88 },
  'US:michigan': { cost: 0.84, salary: 0.9 },
  // UAE
  'AE:dubai': { cost: 1.0, salary: 1.0 },
  'AE:abu dhabi': { cost: 0.95, salary: 1.02 },
  'AE:sharjah': { cost: 0.72, salary: 0.82 },
  'AE:ajman': { cost: 0.64, salary: 0.76 },
  'AE:ras al-khaimah': { cost: 0.62, salary: 0.74 },
  'AE:fujairah': { cost: 0.6, salary: 0.72 },
  'AE:umm al-quwain': { cost: 0.58, salary: 0.7 },
  // UK
  'GB:england': { cost: 1.08, salary: 1.08 },
  'GB:scotland': { cost: 0.82, salary: 0.9 },
  'GB:wales': { cost: 0.76, salary: 0.84 },
  'GB:northern ireland': { cost: 0.74, salary: 0.84 },
  // Germany
  'DE:berlin': { cost: 1.02, salary: 1.02 },
  'DE:bavaria': { cost: 1.15, salary: 1.14 },
  'DE:hamburg': { cost: 1.12, salary: 1.08 },
  'DE:hesse': { cost: 1.08, salary: 1.1 },
  'DE:baden-württemberg': { cost: 1.06, salary: 1.1 },
  'DE:saxony': { cost: 0.84, salary: 0.88 },
  // Canada
  'CA:ontario': { cost: 1.04, salary: 1.05 },
  'CA:british columbia': { cost: 1.08, salary: 1.04 },
  'CA:alberta': { cost: 0.9, salary: 0.98 },
  'CA:quebec': { cost: 0.86, salary: 0.92 },
  'CA:nova scotia': { cost: 0.84, salary: 0.85 },
  'CA:manitoba': { cost: 0.8, salary: 0.84 },
  // Australia
  'AU:new south wales': { cost: 1.14, salary: 1.1 },
  'AU:victoria': { cost: 1.04, salary: 1.04 },
  'AU:australian capital territory': { cost: 1.02, salary: 1.05 },
  'AU:queensland': { cost: 0.94, salary: 0.95 },
  'AU:western australia': { cost: 0.96, salary: 1.0 },
  'AU:south australia': { cost: 0.88, salary: 0.9 },
  // Japan
  'JP:tokyo': { cost: 1.05, salary: 1.08 },
  'JP:kanagawa': { cost: 0.92, salary: 0.98 },
  'JP:osaka': { cost: 0.88, salary: 0.94 },
  'JP:kyoto': { cost: 0.86, salary: 0.9 },
  'JP:aichi': { cost: 0.85, salary: 0.92 },
  'JP:fukuoka': { cost: 0.78, salary: 0.84 },
  'JP:hokkaido': { cost: 0.76, salary: 0.8 },
  // France
  'FR:île-de-france': { cost: 1.24, salary: 1.2 },
  'FR:provence-alpes-côte d\'azur': { cost: 1.02, salary: 0.98 },
  'FR:auvergne-rhône-alpes': { cost: 0.96, salary: 0.98 },
  // China
  'CN:shanghai': { cost: 1.22, salary: 1.24 },
  'CN:beijing': { cost: 1.2, salary: 1.22 },
  'CN:guangdong': { cost: 1.08, salary: 1.12 },
  'CN:zhejiang': { cost: 1.02, salary: 1.06 },
  // South Korea
  'KR:seoul': { cost: 1.12, salary: 1.12 },
  'KR:gyeonggi province': { cost: 0.98, salary: 1.02 },
  'KR:busan': { cost: 0.86, salary: 0.88 },
  // Saudi Arabia
  'SA:riyadh': { cost: 1.08, salary: 1.1 },
  'SA:makkah': { cost: 0.96, salary: 0.96 },
  'SA:eastern province': { cost: 0.95, salary: 1.04 },
  // Singapore
  'SG:central singapore': { cost: 1.06, salary: 1.04 },
  'SG:north east': { cost: 0.94, salary: 0.98 },
  'SG:north west': { cost: 0.92, salary: 0.96 },
  'SG:south east': { cost: 0.98, salary: 1.0 },
  'SG:south west': { cost: 0.94, salary: 0.98 }
};

// Indian District Tier Multipliers (baseline 1.00 = Hyderabad)
const INDIA_DISTRICT_INDEX = [
  { match: ['mumbai', 'mumbai suburban'], cost: 1.68, salary: 1.45, tierLabel: 'Tier-1 Financial Metro' },
  { match: ['bengaluru urban', 'bangalore urban', 'bengaluru'], cost: 1.38, salary: 1.38, tierLabel: 'Tier-1 Tech Metro' },
  { match: ['new delhi', 'south delhi', 'central delhi', 'gurugram', 'gurgaon', 'gautam buddha nagar', 'noida'], cost: 1.32, salary: 1.34, tierLabel: 'Tier-1 NCR Hub' },
  { match: ['thane', 'pune'], cost: 1.16, salary: 1.18, tierLabel: 'Tier-1 Tech Hub' },
  { match: ['hyderabad', 'rangareddy', 'ranga reddy', 'medchal', 'medchal-malkajgiri'], cost: 1.0, salary: 1.0, tierLabel: 'Tier-1 Tech Hub' },
  { match: ['chennai', 'kancheepuram', 'chengalpattu'], cost: 1.02, salary: 1.05, tierLabel: 'Tier-1 Metro' },
  { match: ['kolkata', 'north 24 parganas'], cost: 0.9, salary: 0.92, tierLabel: 'Tier-1 Metro' },
  { match: ['chandigarh', 'ahmedabad', 'ernakulam', 'kochi', 'jaipur', 'surat', 'indore', 'visakhapatnam', 'coimbatore', 'thiruvananthapuram', 'lucknow', 'nagpur', 'vadodara', 'mysuru', 'mysore', 'khordha', 'bhubaneswar', 'dakshina kannada', 'mangaluru', 'north goa', 'south goa', 'dehradun', 'patna', 'bhopal', 'nashik', 'ludhiana', 'rajkot', 'vijayawada', 'krishna', 'ntr', 'guntur', 'warangal', 'hanumakonda'], cost: 0.78, salary: 0.8, tierLabel: 'Tier-2 Growth City' }
];

const INDIA_STATE_BIAS = {
  maharashtra: 1.05, karnataka: 1.04, delhi: 1.15, goa: 1.1, kerala: 1.02,
  tamil: 1.0, telangana: 0.98, gujarat: 0.98, haryana: 1.04, punjab: 0.96,
  andhra: 0.94, west: 0.93, rajasthan: 0.92, uttar: 0.9, madhya: 0.9,
  bihar: 0.86, odisha: 0.88, jharkhand: 0.88, assam: 0.9
};

function getIndiaStatesNormalized() {
  try {
    if (typeof getAllIndiaStatesFn === 'function') {
      const raw = getAllIndiaStatesFn() || [];
      const list = raw
        .map((s) => {
          if (typeof s === 'string') return { code: s, name: s };
          const code = s.code || s.stateCode || s.isoCode || s.id || s.name;
          const name = s.name || s.stateName || s.state || code;
          return { code: String(code), name: String(name) };
        })
        .filter((s) => s.code && s.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      if (list.length > 0) return list;
    }
  } catch {}

  const fallback = (StateAPI?.getStatesOfCountry('IN') || []).map((s) => ({
    code: s.isoCode,
    name: s.name
  }));
  return fallback.sort((a, b) => a.name.localeCompare(b.name));
}

function getIndiaDistrictsNormalized(stateCodeOrName) {
  if (!stateCodeOrName) return [];
  const states = getIndiaStatesNormalized();
  const matchState = states.find(
    (s) =>
      s.code.toLowerCase() === String(stateCodeOrName).toLowerCase() ||
      s.name.toLowerCase() === String(stateCodeOrName).toLowerCase()
  );
  const code = matchState ? matchState.code : String(stateCodeOrName);

  try {
    if (typeof getIndiaDistrictsFn === 'function') {
      const raw = getIndiaDistrictsFn(code) || [];
      const list = raw
        .map((d) => (typeof d === 'string' ? d : d.name || d.district || String(d)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      if (list.length > 0) return list;
    }
  } catch {}

  return matchState ? [matchState.name] : [];
}

function getStatesForCountry(countryCode) {
  const code = String(countryCode || 'IN').toUpperCase();
  if (code === 'IN') return getIndiaStatesNormalized();

  const raw = StateAPI?.getStatesOfCountry(code) || [];
  const list = raw
    .map((s) => ({ code: s.isoCode || s.name, name: s.name }))
    .filter((s) => s.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (list.length > 0) return list;
  const c = COUNTRIES[code];
  return c ? [{ code, name: c.name }] : [];
}

function getLocationAdjustment(countryCode, stateName, districtName) {
  const cCode = String(countryCode || 'IN').toUpperCase();
  const stLower = String(stateName || '').trim().toLowerCase();
  const distLower = String(districtName || '').trim().toLowerCase();

  if (cCode === 'IN') {
    if (distLower) {
      for (const rule of INDIA_DISTRICT_INDEX) {
        if (rule.match.some((m) => distLower === m || distLower.includes(m))) {
          return { costMult: rule.cost, salaryMult: rule.salary, tierLabel: rule.tierLabel };
        }
      }
      const firstWord = stLower.split(/\s+/)[0];
      const bias = INDIA_STATE_BIAS[firstWord] || 0.92;
      return {
        costMult: Number((0.6 * bias).toFixed(2)),
        salaryMult: Number((0.66 * bias).toFixed(2)),
        tierLabel: 'Tier-3 / Regional District'
      };
    }
    const firstWord = stLower.split(/\s+/)[0];
    const bias = INDIA_STATE_BIAS[firstWord] || 0.95;
    return { costMult: bias, salaryMult: bias, tierLabel: 'State Average' };
  }

  const key = `${cCode}:${stLower}`;
  if (STATE_INDEX[key]) {
    return {
      costMult: STATE_INDEX[key].cost,
      salaryMult: STATE_INDEX[key].salary,
      tierLabel: 'Regional Hub Index'
    };
  }

  // Deterministic gentle regional variance (0.86 - 0.96) for non-capital states
  let hash = 0;
  for (let i = 0; i < stLower.length; i++) hash = (hash * 31 + stLower.charCodeAt(i)) % 11;
  const costMult = Number((0.86 + hash * 0.01).toFixed(2));
  const salaryMult = Number((0.88 + hash * 0.01).toFixed(2));
  return { costMult, salaryMult, tierLabel: 'State Baseline' };
}

function buildLocationProfile({ countryCode, stateCode, stateName, districtName }) {
  const cCode = String(countryCode || 'IN').toUpperCase();
  const country = COUNTRIES[cCode] || COUNTRIES.IN;
  const states = getStatesForCountry(country.code);

  let resolvedState = states.find(
    (s) =>
      (stateCode && s.code.toLowerCase() === String(stateCode).toLowerCase()) ||
      (stateName && s.name.toLowerCase() === String(stateName).toLowerCase())
  );
  if (!resolvedState) resolvedState = states[0] || { code: country.code, name: country.name };

  let resolvedDistrict = '';
  if (country.hasDistricts) {
    const districts = getIndiaDistrictsNormalized(resolvedState.code);
    const matchDist = districts.find(
      (d) => districtName && d.toLowerCase() === String(districtName).toLowerCase()
    );
    resolvedDistrict = matchDist || districts[0] || '';
  }

  const adj = getLocationAdjustment(country.code, resolvedState.name, resolvedDistrict);
  const displayName = resolvedDistrict
    ? resolvedDistrict
    : resolvedState.name === country.name
      ? country.name
      : resolvedState.name;

  const fullLabel = resolvedDistrict
    ? `${resolvedDistrict}, ${resolvedState.name}, ${country.name}`
    : resolvedState.name === country.name
      ? country.name
      : `${resolvedState.name}, ${country.name}`;

  const adjustedBasket = {
    rent: Math.round(country.basket.rent * adj.costMult),
    food: Math.round(country.basket.food * (0.4 + 0.6 * adj.costMult)),
    transport: Math.round(country.basket.transport * (0.5 + 0.5 * adj.costMult)),
    utilities: Math.round(country.basket.utilities * (0.55 + 0.45 * adj.costMult)),
    lifestyle: Math.round(country.basket.lifestyle * adj.costMult)
  };

  return {
    id: `${country.code}:${resolvedState.code}:${resolvedDistrict}`,
    name: displayName,
    fullLabel,
    countryCode: country.code,
    country: country.name,
    stateCode: resolvedState.code,
    stateName: resolvedState.name,
    districtName: resolvedDistrict,
    flag: country.flag,
    currency: country.currency,
    symbol: country.symbol,
    tagline: `${adj.tierLabel} • ${country.tagline}`,
    avgTechSalary: Math.round(country.avgTechSalary * adj.salaryMult),
    effectiveTaxRate: country.effectiveTaxRate,
    tierScale: country.tierScale,
    basket: adjustedBasket
  };
}

// Fallback baseline rates vs USD for all 19 currencies
const FALLBACK_RATES_USD = {
  USD: 1, INR: 86.0, AED: 3.6725, SGD: 1.34, GBP: 0.79, EUR: 0.92,
  CAD: 1.4, AUD: 1.54, JPY: 154.0, KRW: 1390.0, CNY: 7.24, SAR: 3.75,
  BRL: 5.8, MXN: 20.2, IDR: 15900.0, ZAR: 18.2, TRY: 34.5, ARS: 1005.0, RUB: 98.0
};

let cachedDailyRates = null;
let lastDailyFetchMs = 0;
const livePairCache = new Map(); // key: "FROM/TO" -> { rate, timestampIso, fetchedAtMs }

async function getDailyRates(forceRefresh = false) {
  const now = Date.now();
  const expiredBySchedule = cachedDailyRates?.nextUpdateMs && now >= cachedDailyRates.nextUpdateMs;
  if (!forceRefresh && cachedDailyRates && !expiredBySchedule && now - lastDailyFetchMs < 10 * 60 * 1000) {
    return cachedDailyRates;
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4500);
    const resp = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(t);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.result === 'success' && data.rates && data.rates.INR) {
        cachedDailyRates = {
          base: 'USD',
          source: 'ExchangeRate Open API (Daily)',
          updatedAt: data.time_last_update_utc || new Date().toUTCString(),
          checkedAt: new Date().toISOString(),
          nextUpdateMs: data.time_next_update_unix ? data.time_next_update_unix * 1000 : now + 10 * 60 * 1000,
          isLive: true,
          rates: { ...FALLBACK_RATES_USD, ...data.rates }
        };
        lastDailyFetchMs = now;
        return cachedDailyRates;
      }
    }
  } catch {}

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4500);
    const resp = await fetch('https://api.frankfurter.dev/v2/rates?base=USD', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(t);
    if (resp.ok) {
      const list = await resp.json();
      if (Array.isArray(list) && list.length > 0) {
        const rates = { USD: 1 };
        for (const item of list) {
          if (item.quote && typeof item.rate === 'number') rates[item.quote.toUpperCase()] = item.rate;
        }
        if (rates.INR) {
          cachedDailyRates = {
            base: 'USD',
            source: 'Frankfurter Central Bank API (Daily)',
            updatedAt: list[0].date || new Date().toISOString().slice(0, 10),
            checkedAt: new Date().toISOString(),
            nextUpdateMs: now + 10 * 60 * 1000,
            isLive: true,
            rates: { ...FALLBACK_RATES_USD, ...rates }
          };
          lastDailyFetchMs = now;
          return cachedDailyRates;
        }
      }
    }
  } catch {}

  return {
    base: 'USD',
    source: 'Offline Fallback Reference Rates',
    updatedAt: new Date().toISOString(),
    checkedAt: new Date().toISOString(),
    isLive: false,
    rates: FALLBACK_RATES_USD
  };
}

// On-Demand Active Pair Fetching via Twelve Data (1-Minute Live Cache, 1-2 credits max)
async function fetchTwelveDataPair(baseCur, quoteCur, forceRefresh = false) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey || baseCur === quoteCur) return null;

  const pair = `${baseCur}/${quoteCur}`;
  const now = Date.now();
  const cached = livePairCache.get(pair);
  if (!forceRefresh && cached && now - cached.fetchedAtMs < 60 * 1000) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const url = `https://api.twelvedata.com/exchange_rate?symbol=${encodeURIComponent(pair)}&apikey=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(t);
    if (!resp.ok) return null;
    const data = await resp.json();
    const numericRate = Number(data?.rate);
    if (Number.isFinite(numericRate) && numericRate > 0) {
      const entry = {
        pair,
        rate: numericRate,
        timestampIso: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString(),
        fetchedAtMs: now
      };
      livePairCache.set(pair, entry);
      return entry;
    }
  } catch {}

  return cached || null;
}

function getCityScale(profile, lifestyle) {
  const tier = profile.tierScale?.[lifestyle] || profile.tierScale?.standard || {
    rent: 1, food: 1, transport: 1, utilities: 1, lifestyle: 1
  };
  return {
    rent: profile.basket.rent * (tier.rent ?? 1),
    food: profile.basket.food * (tier.food ?? 1),
    transport: profile.basket.transport * (tier.transport ?? 1),
    utilities: profile.basket.utilities * (tier.utilities ?? 1),
    lifestyle: profile.basket.lifestyle * (tier.lifestyle ?? 1)
  };
}

function sumScaledBasket(scaledBasket) {
  return Object.values(scaledBasket).reduce((acc, v) => acc + v, 0);
}

function renderCleanPage({ endpoint, title, subtitle, sectionTitle, visualHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — DreamCity Teleporter</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=1" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif; background: #f4f6fc; color: #0f172a; line-height: 1.5; padding-bottom: 48px; }
    .topbar { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 24px 20px; }
    .topbar-inner { max-width: 1060px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; }
    .badges { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .pill { font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 999px; letter-spacing: 0.04em; text-transform: uppercase; }
    .p-ok { background: #16a34a; color: #fff; }
    .p-path { background: rgba(255,255,255,0.16); color: #e0e7ff; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; text-transform: none; }
    h1 { font-size: 1.45rem; font-weight: 800; }
    .sub { font-size: 0.85rem; color: #c7d2fe; margin-top: 3px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.28); color: #fff; text-decoration: none; padding: 9px 14px; border-radius: 9px; font-size: 0.82rem; font-weight: 700; cursor: pointer; }
    .btn:hover { background: rgba(255,255,255,0.24); }
    .wrap { max-width: 1060px; margin: 22px auto 0; padding: 0 20px; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; box-shadow: 0 8px 24px rgba(15,23,42,0.06); }
    .card-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
    .card-head h2 { font-size: 1.05rem; font-weight: 800; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 12px; }
    .tile { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 15px; }
    .tile-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .code { font-size: 0.78rem; font-weight: 800; background: #eef2ff; color: #4f46e5; padding: 2px 8px; border-radius: 6px; }
    .big { font-size: 1.2rem; font-weight: 900; font-variant-numeric: tabular-nums; }
    .muted { font-size: 0.77rem; color: #64748b; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
    th, td { padding: 11px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { background: #f8fafc; font-size: 0.74rem; text-transform: uppercase; color: #64748b; }
    .num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 700; }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <div>
        <div class="badges"><span class="pill p-ok">Live Data</span><span class="pill p-path">${endpoint}</span></div>
        <h1>${title}</h1>
        <p class="sub">${subtitle}</p>
      </div>
      <div class="actions">
        <a href="/" class="btn">← Back to DreamCity Teleporter</a>
        <a href="${endpoint === '/api/rates' ? '/api/cities' : '/api/rates'}" class="btn">
          ${endpoint === '/api/rates' ? 'View Global Hubs' : 'View Live Exchange Rates'}
        </a>
      </div>
    </div>
  </header>
  <main class="wrap">
    <section class="card">
      <div class="card-head"><h2>${sectionTitle}</h2><span class="muted">Served live from Node.js Express backend</span></div>
      ${visualHtml}
    </section>
  </main>
</body>
</html>`;
}

// --- NEW CASCADING LOCATION ENDPOINTS ---
app.get('/api/locations/countries', (req, res) => {
  const countries = Object.values(COUNTRIES).map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    currency: c.currency,
    symbol: c.symbol,
    hasDistricts: c.hasDistricts,
    avgTechSalary: c.avgTechSalary,
    effectiveTaxRate: c.effectiveTaxRate
  }));
  res.json({ count: countries.length, countries });
});

app.get('/api/locations/states', (req, res) => {
  const countryCode = String(req.query.country || 'IN').toUpperCase();
  if (!COUNTRIES[countryCode]) {
    return res.status(400).json({ error: 'Unsupported country code.' });
  }
  const states = getStatesForCountry(countryCode);
  res.json({
    country: countryCode,
    hasDistricts: COUNTRIES[countryCode].hasDistricts,
    count: states.length,
    states
  });
});

app.get('/api/locations/districts', (req, res) => {
  const state = req.query.state;
  if (!state) return res.status(400).json({ error: 'Missing state parameter.' });
  const districts = getIndiaDistrictsNormalized(state);
  res.json({ state, count: districts.length, districts });
});

// --- GLOBAL HUBS DATABASE (/api/cities) ---
app.get('/api/cities', (req, res) => {
  const hubs = WORLD_HUBS.map((h) => {
    const prof = buildLocationProfile({
      countryCode: h.countryCode,
      stateName: h.stateName,
      districtName: h.districtName
    });
    return { ...prof, id: h.id, name: h.name };
  });

  const payload = { count: hubs.length, countriesCount: Object.keys(COUNTRIES).length, cities: hubs };
  const wantsHtml = (req.headers.accept || '').includes('text/html') && req.query.raw !== '1';
  if (!wantsHtml) return res.json(payload);

  const rows = Object.values(COUNTRIES).map((c) => {
    const total = Object.values(c.basket).reduce((s, v) => s + v, 0);
    return `<tr>
      <td><strong>${c.flag} ${c.name}</strong> ${c.hasDistricts ? '<span class="code">States + Districts</span>' : '<span class="code">States Only</span>'}</td>
      <td><span class="code">${c.currency}</span></td>
      <td class="num">${c.symbol}${c.avgTechSalary.toLocaleString()}</td>
      <td class="num">${Math.round(c.effectiveTaxRate * 100)}%</td>
      <td class="num">${c.symbol}${c.basket.rent.toLocaleString()}</td>
      <td class="num" style="color:#4f46e5;">${c.symbol}${total.toLocaleString()}</td>
    </tr>`;
  }).join('');

  res.type('html').send(renderCleanPage({
    endpoint: '/api/cities',
    title: 'G20 + UAE + Singapore Global Database',
    subtitle: `${Object.keys(COUNTRIES).length} countries (India States & Districts + G20/UAE/Singapore States)`,
    sectionTitle: 'Country Baseline Cost-of-Living & Tax Table',
    visualHtml: `<div style="overflow-x:auto;"><table>
      <thead><tr><th>Country</th><th>Currency</th><th class="num">Avg Tech Salary/mo</th><th class="num">Tax Rate</th><th class="num">Base 1BHK Rent</th><th class="num">Base Monthly Basket</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`
  }));
});

// --- LIVE EXCHANGE RATES (/api/rates) ---
app.get('/api/rates', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const forceRefresh = req.query.fresh === '1';
  const rateBundle = await getDailyRates(forceRefresh);
  const currencies = Object.keys(FALLBACK_RATES_USD);
  const subset = {};
  for (const code of currencies) {
    subset[code] = rateBundle.rates[code] || FALLBACK_RATES_USD[code];
  }

  const payload = {
    base: rateBundle.base,
    source: rateBundle.source,
    twelveDataEnabled: Boolean(process.env.TWELVE_DATA_API_KEY),
    updatedAt: rateBundle.updatedAt,
    checkedAt: rateBundle.checkedAt || new Date().toISOString(),
    isLive: rateBundle.isLive,
    rates: subset
  };

  const wantsHtml = (req.headers.accept || '').includes('text/html') && req.query.raw !== '1';
  if (!wantsHtml) return res.json(payload);

  const inrPerUsd = subset.INR || 86;
  const cards = Object.entries(subset).map(([code, perUsd]) => {
    const inrVal = inrPerUsd / perUsd;
    const headline = code === 'INR' ? `₹${inrPerUsd.toFixed(2)} / $1` : `1 ${code} = ₹${inrVal.toFixed(2)}`;
    const detail = code === 'USD' ? 'Global Base Currency' : `1 USD = ${perUsd.toFixed(4)} ${code}`;
    return `<div class="tile">
      <div class="tile-top"><span class="muted" style="font-weight:700;">${code}</span><span class="code">${code}</span></div>
      <div class="big">${headline}</div>
      <div class="muted">${detail}</div>
    </div>`;
  }).join('');

  res.type('html').send(renderCleanPage({
    endpoint: '/api/rates',
    title: 'Live Global Exchange Rates (19 Currencies)',
    subtitle: `${payload.source}${payload.twelveDataEnabled ? ' + Twelve Data 1-Min Active Pair Live Feed' : ''}`,
    sectionTitle: 'G20 + UAE + Singapore Currency Rates (vs. INR & USD)',
    visualHtml: `<div class="grid">${cards}</div>`
  }));
});

// --- MAIN TELEPORT ENGINE (/api/teleport) ---
app.post('/api/teleport', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const body = req.body || {};
    const {
      fromCity,
      toCity,
      fromCountry,
      fromState,
      fromDistrict,
      toCountry,
      toState,
      toDistrict,
      monthlySalary = 60000,
      targetOfferSalary = null,
      lifestyle = 'standard',
      forceLiveTick = false
    } = body;

    let from;
    let to;

    if (fromCountry || toCountry) {
      from = buildLocationProfile({
        countryCode: fromCountry || 'IN',
        stateCode: fromState,
        stateName: fromState,
        districtName: fromDistrict
      });
      to = buildLocationProfile({
        countryCode: toCountry || 'AE',
        stateCode: toState,
        stateName: toState,
        districtName: toDistrict
      });
    } else {
      const legacyFrom = WORLD_HUBS.find((h) => h.id === fromCity) || WORLD_HUBS[0];
      const legacyTo = WORLD_HUBS.find((h) => h.id === toCity) || WORLD_HUBS[3];
      from = buildLocationProfile({
        countryCode: legacyFrom.countryCode,
        stateName: legacyFrom.stateName,
        districtName: legacyFrom.districtName
      });
      to = buildLocationProfile({
        countryCode: legacyTo.countryCode,
        stateName: legacyTo.stateName,
        districtName: legacyTo.districtName
      });
    }

    const validLifestyle = ['student', 'standard', 'comfort'].includes(lifestyle) ? lifestyle : 'standard';
    const salary = Math.max(100, Number(monthlySalary) || from.avgTechSalary);

    // 1. Get baseline daily rates (all 19 currencies, 0 Twelve Data credits)
    const rateBundle = await getDailyRates();
    const rFromBase = rateBundle.rates[from.currency] || FALLBACK_RATES_USD[from.currency];
    const rToBase = rateBundle.rates[to.currency] || FALLBACK_RATES_USD[to.currency];
    const rINRBase = rateBundle.rates.INR || FALLBACK_RATES_USD.INR;

    // 2. Smart On-Demand Active Pair Fetching via Twelve Data (1-min live tick, max 1-2 credits)
    let marketRate = rToBase / rFromBase;
    let oneToInINR = rINRBase / rToBase;
    let oneFromInINR = rINRBase / rFromBase;
    let liveTickInfo = {
      active: false,
      provider: rateBundle.source,
      pair: `${from.currency}/${to.currency}`,
      updatedAt: rateBundle.updatedAt
    };

    if (from.currency === to.currency) {
      marketRate = 1;
      liveTickInfo = {
        active: true,
        provider: 'Same-Currency Direct Mode (0 API Credits)',
        pair: `${from.currency}/${to.currency}`,
        updatedAt: new Date().toISOString()
      };
    } else if (process.env.TWELVE_DATA_API_KEY) {
      if (from.currency === 'INR') {
        const tick = await fetchTwelveDataPair(to.currency, 'INR', Boolean(forceLiveTick));
        if (tick) {
          oneToInINR = tick.rate;
          oneFromInINR = 1;
          marketRate = 1 / tick.rate;
          liveTickInfo = {
            active: true,
            provider: 'Twelve Data 1-Min Live Forex',
            pair: tick.pair,
            updatedAt: tick.timestampIso
          };
        }
      } else if (to.currency === 'INR') {
        const tick = await fetchTwelveDataPair(from.currency, 'INR', Boolean(forceLiveTick));
        if (tick) {
          oneFromInINR = tick.rate;
          oneToInINR = 1;
          marketRate = tick.rate;
          liveTickInfo = {
            active: true,
            provider: 'Twelve Data 1-Min Live Forex',
            pair: tick.pair,
            updatedAt: tick.timestampIso
          };
        }
      } else {
        const tick = await fetchTwelveDataPair(from.currency, to.currency, Boolean(forceLiveTick));
        if (tick) {
          marketRate = tick.rate;
          liveTickInfo = {
            active: true,
            provider: 'Twelve Data 1-Min Live Forex',
            pair: tick.pair,
            updatedAt: tick.timestampIso
          };
        }
      }
    }

    const fromScaled = getCityScale(from, validLifestyle);
    const toScaled = getCityScale(to, validLifestyle);
    const fromBasketTotal = sumScaledBasket(fromScaled);
    const toBasketTotal = sumScaledBasket(toScaled);

    const fromBasketINR = fromBasketTotal * oneFromInINR;
    const toBasketINR = toBasketTotal * oneToInINR;
    const costMultiplier = fromBasketINR > 0 ? toBasketINR / fromBasketINR : 1;
    const pppExchangeRate = fromBasketTotal > 0 ? toBasketTotal / fromBasketTotal : 1;

    const requiredTargetLocal = salary * pppExchangeRate;
    const requiredTargetINR = requiredTargetLocal * oneToInINR;
    const nominalConvertedLocal = salary * marketRate;
    const realPowerPercent = requiredTargetLocal > 0 ? (nominalConvertedLocal / requiredTargetLocal) * 100 : 100;

    const categories = ['rent', 'food', 'transport', 'utilities', 'lifestyle'];
    const labels = {
      rent: '1BHK Apartment Rent',
      food: 'Monthly Food & Groceries',
      transport: 'Metro & Local Transit',
      utilities: 'Wi-Fi, Electricity & Water',
      lifestyle: 'Dining Out, Gym & Weekend'
    };

    const basketComparison = categories.map((key) => {
      const fLocal = Math.round(fromScaled[key]);
      const tLocal = Math.round(toScaled[key]);
      const fINR = Math.round(fLocal * oneFromInINR);
      const tINR = Math.round(tLocal * oneToInINR);
      const ratio = fINR > 0 ? tINR / fINR : 1;
      return { key, label: labels[key], fromLocal: fLocal, toLocal: tLocal, fromINR: fINR, toINR: tINR, ratio: Number(ratio.toFixed(2)) };
    });

    const evaluatedTargetSalary =
      targetOfferSalary !== null && Number(targetOfferSalary) > 0
        ? Number(targetOfferSalary)
        : to.avgTechSalary;

    const fromNetMonthly = salary * (1 - from.effectiveTaxRate);
    const toNetMonthly = evaluatedTargetSalary * (1 - to.effectiveTaxRate);
    const fromSavingsLocal = fromNetMonthly - fromBasketTotal;
    const toSavingsLocal = toNetMonthly - toBasketTotal;
    const fromSavingsINR = fromSavingsLocal * oneFromInINR;
    const toSavingsINR = toSavingsLocal * oneToInINR;

    const globalOverview = WORLD_HUBS.map((hub) => {
      const hProf = buildLocationProfile({
        countryCode: hub.countryCode,
        stateName: hub.stateName,
        districtName: hub.districtName
      });
      const rHub = rateBundle.rates[hProf.currency] || FALLBACK_RATES_USD[hProf.currency];
      const oneHubInINR = hProf.currency === to.currency ? oneToInINR : rINRBase / rHub;
      const hScaled = getCityScale(hProf, validLifestyle);
      const hBasket = sumScaledBasket(hScaled);
      const hBasketINR = hBasket * oneHubInINR;
      const multiplierVsFrom = fromBasketINR > 0 ? hBasketINR / fromBasketINR : 1;
      const neededLocal = fromBasketTotal > 0 ? salary * (hBasket / fromBasketTotal) : salary;
      const neededINR = neededLocal * oneHubInINR;

      return {
        id: hub.id,
        name: hub.name,
        countryCode: hProf.countryCode,
        stateCode: hProf.stateCode,
        stateName: hProf.stateName,
        districtName: hProf.districtName,
        flag: hProf.flag,
        currency: hProf.currency,
        symbol: hProf.symbol,
        costMultiplier: Number(multiplierVsFrom.toFixed(2)),
        requiredMonthlyLocal: Math.round(neededLocal),
        requiredMonthlyINR: Math.round(neededINR),
        effectiveTaxPct: Math.round(hProf.effectiveTaxRate * 100)
      };
    });

    res.json({
      meta: {
        source: liveTickInfo.provider,
        liveTickActive: liveTickInfo.active,
        activePair: liveTickInfo.pair,
        updatedAt: liveTickInfo.updatedAt,
        checkedAt: new Date().toISOString(),
        isLive: rateBundle.isLive || liveTickInfo.active,
        lifestyle: validLifestyle
      },
      from,
      to,
      exchange: {
        marketRate: Number(marketRate.toFixed(4)),
        pppRate: Number(pppExchangeRate.toFixed(4)),
        oneToInINR: Number(oneToInINR.toFixed(2)),
        oneFromInINR: Number(oneFromInINR.toFixed(2))
      },
      summary: {
        inputSalaryFromLocal: Math.round(salary),
        inputSalaryINR: Math.round(salary * oneFromInINR),
        nominalConvertedLocal: Math.round(nominalConvertedLocal),
        requiredTargetLocal: Math.round(requiredTargetLocal),
        requiredTargetAnnualLocal: Math.round(requiredTargetLocal * 12),
        requiredTargetINR: Math.round(requiredTargetINR),
        requiredTargetAnnualLPA: Number(((requiredTargetINR * 12) / 100000).toFixed(2)),
        costMultiplier: Number(costMultiplier.toFixed(2)),
        realPowerPercent: Number(realPowerPercent.toFixed(1)),
        fromBasketTotal: Math.round(fromBasketTotal),
        toBasketTotal: Math.round(toBasketTotal),
        fromBasketINR: Math.round(fromBasketINR),
        toBasketINR: Math.round(toBasketINR)
      },
      offerShowdown: {
        isCustomOffer: targetOfferSalary !== null && Number(targetOfferSalary) > 0,
        fromGrossLocal: Math.round(salary),
        fromNetLocal: Math.round(fromNetMonthly),
        fromSavingsLocal: Math.round(fromSavingsLocal),
        fromSavingsINR: Math.round(fromSavingsINR),
        fromFiveYearSavingsINR: Math.round(fromSavingsINR * 60),
        toGrossLocal: Math.round(evaluatedTargetSalary),
        toNetLocal: Math.round(toNetMonthly),
        toSavingsLocal: Math.round(toSavingsLocal),
        toSavingsINR: Math.round(toSavingsINR),
        toFiveYearSavingsINR: Math.round(toSavingsINR * 60),
        winnerCityId: toSavingsINR >= fromSavingsINR ? to.id : from.id,
        monthlyGainINR: Math.round(toSavingsINR - fromSavingsINR)
      },
      basketComparison,
      globalOverview
    });
  } catch (err) {
    console.error('Teleport calculation error:', err);
    res.status(500).json({ error: 'Server failed to calculate location teleport data.' });
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`DreamCity Teleporter running at http://localhost:${PORT}`));
}

export default app;
