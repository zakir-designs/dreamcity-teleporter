import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CITIES = {
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    tagline: 'HITEC City Tech Hub',
    avgTechSalary: 55000,
    effectiveTaxRate: 0.08,
    basket: { rent: 16000, food: 9000, transport: 2500, utilities: 3000, lifestyle: 5500 }
  },
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    tagline: 'Silicon Valley of India',
    avgTechSalary: 75000,
    effectiveTaxRate: 0.12,
    basket: { rent: 24000, food: 11000, transport: 3500, utilities: 3500, lifestyle: 8000 }
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    tagline: 'Financial Capital of India',
    avgTechSalary: 80000,
    effectiveTaxRate: 0.12,
    basket: { rent: 34000, food: 12000, transport: 3000, utilities: 4000, lifestyle: 9000 }
  },
  dubai: {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED ',
    tagline: '0% Income Tax Global Hub',
    avgTechSalary: 15000,
    effectiveTaxRate: 0.0,
    basket: { rent: 5500, food: 1800, transport: 450, utilities: 750, lifestyle: 1500 }
  },
  singapore: {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    symbol: 'S$',
    tagline: 'Asia Fintech Powerhouse',
    avgTechSalary: 6000,
    effectiveTaxRate: 0.07,
    basket: { rent: 2400, food: 800, transport: 150, utilities: 200, lifestyle: 550 }
  },
  london: {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    tagline: 'European Finance & AI Center',
    avgTechSalary: 4200,
    effectiveTaxRate: 0.24,
    basket: { rent: 1750, food: 450, transport: 180, utilities: 240, lifestyle: 380 }
  },
  berlin: {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    symbol: '€',
    tagline: 'EU Startup Capital',
    avgTechSalary: 4600,
    effectiveTaxRate: 0.34,
    basket: { rent: 1250, food: 420, transport: 60, utilities: 260, lifestyle: 310 }
  },
  toronto: {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'C$',
    tagline: 'North American Tech Corridor',
    avgTechSalary: 6500,
    effectiveTaxRate: 0.25,
    basket: { rent: 2150, food: 600, transport: 160, utilities: 210, lifestyle: 380 }
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    symbol: '¥',
    tagline: 'Robotics & Engineering Capital',
    avgTechSalary: 420000,
    effectiveTaxRate: 0.2,
    basket: { rent: 115000, food: 55000, transport: 15000, utilities: 20000, lifestyle: 35000 }
  },
  newyork: {
    id: 'newyork',
    name: 'New York',
    country: 'USA',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    tagline: 'Global Tech & Wall Street',
    avgTechSalary: 9500,
    effectiveTaxRate: 0.28,
    basket: { rent: 2900, food: 700, transport: 140, utilities: 220, lifestyle: 540 }
  }
};

const LIFESTYLE_MULT = { student: 0.72, standard: 1.0, comfort: 1.45 };

const FALLBACK_RATES_USD = {
  USD: 1, INR: 85.0, AED: 3.6725, SGD: 1.34,
  GBP: 0.79, EUR: 0.92, CAD: 1.39, JPY: 153.0
};

let cachedRates = null;
let lastFetchedAt = 0;

async function getLiveRates() {
  const now = Date.now();
  if (cachedRates && now - lastFetchedAt < 30 * 60 * 1000) return cachedRates;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4500);
    const resp = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
    clearTimeout(t);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.result === 'success' && data.rates && data.rates.INR) {
        cachedRates = {
          base: 'USD',
          source: 'Live Global ExchangeRate Open API',
          updatedAt: data.time_last_update_utc || new Date().toUTCString(),
          isLive: true,
          rates: data.rates
        };
        lastFetchedAt = now;
        return cachedRates;
      }
    }
  } catch {}

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4500);
    const resp = await fetch('https://api.frankfurter.dev/v2/rates?base=USD', { signal: controller.signal });
    clearTimeout(t);
    if (resp.ok) {
      const list = await resp.json();
      if (Array.isArray(list) && list.length > 0) {
        const rates = { USD: 1 };
        for (const item of list) {
          if (item.quote && typeof item.rate === 'number') {
            rates[item.quote.toUpperCase()] = item.rate;
          }
        }
        if (rates.INR) {
          cachedRates = {
            base: 'USD',
            source: 'Live Frankfurter Central Bank API',
            updatedAt: list[0].date || new Date().toISOString().slice(0, 10),
            isLive: true,
            rates: { ...FALLBACK_RATES_USD, ...rates }
          };
          lastFetchedAt = now;
          return cachedRates;
        }
      }
    }
  } catch {}

  return {
    base: 'USD',
    source: 'Offline Fallback Reference Rates',
    updatedAt: new Date().toISOString().slice(0, 10),
    isLive: false,
    rates: FALLBACK_RATES_USD
  };
}

function sumBasket(basket, mult) {
  return Object.values(basket).reduce((acc, v) => acc + v * mult, 0);
}

app.get('/api/cities', (req, res) => {
  res.json({ count: Object.keys(CITIES).length, cities: Object.values(CITIES) });
});

app.get('/api/rates', async (req, res) => {
  const rateBundle = await getLiveRates();
  const subset = {};
  for (const code of ['USD', 'INR', 'AED', 'SGD', 'GBP', 'EUR', 'CAD', 'JPY']) {
    subset[code] = rateBundle.rates[code] || FALLBACK_RATES_USD[code];
  }
  res.json({
    base: rateBundle.base,
    source: rateBundle.source,
    updatedAt: rateBundle.updatedAt,
    isLive: rateBundle.isLive,
    rates: subset
  });
});

app.post('/api/teleport', async (req, res) => {
  try {
    const {
      fromCity = 'hyderabad',
      toCity = 'dubai',
      monthlySalary = 60000,
      targetOfferSalary = null,
      lifestyle = 'standard'
    } = req.body || {};

    const from = CITIES[fromCity];
    const to = CITIES[toCity];
    if (!from || !to) {
      return res.status(400).json({ error: 'Invalid origin or destination city selected.' });
    }

    const salary = Math.max(100, Number(monthlySalary) || from.avgTechSalary);
    const mult = LIFESTYLE_MULT[lifestyle] || 1.0;

    const rateBundle = await getLiveRates();
    const rFrom = rateBundle.rates[from.currency] || FALLBACK_RATES_USD[from.currency];
    const rTo = rateBundle.rates[to.currency] || FALLBACK_RATES_USD[to.currency];
    const rINR = rateBundle.rates.INR || FALLBACK_RATES_USD.INR;

    const marketRate = rTo / rFrom;
    const fromBasketTotal = sumBasket(from.basket, mult);
    const toBasketTotal = sumBasket(to.basket, mult);

    const fromBasketUSD = fromBasketTotal / rFrom;
    const toBasketUSD = toBasketTotal / rTo;
    const costMultiplier = toBasketUSD / fromBasketUSD;
    const pppExchangeRate = toBasketTotal / fromBasketTotal;

    const requiredTargetLocal = salary * pppExchangeRate;
    const requiredTargetINR = (requiredTargetLocal / rTo) * rINR;
    const nominalConvertedLocal = salary * marketRate;
    const realPowerPercent = (nominalConvertedLocal / requiredTargetLocal) * 100;

    const categories = ['rent', 'food', 'transport', 'utilities', 'lifestyle'];
    const labels = {
      rent: '1BHK Apartment Rent',
      food: 'Monthly Food & Groceries',
      transport: 'Metro & Local Transit',
      utilities: 'Wi-Fi, Electricity & Water',
      lifestyle: 'Dining Out, Gym & Weekend'
    };

    const basketComparison = categories.map((key) => {
      const fLocal = Math.round(from.basket[key] * mult);
      const tLocal = Math.round(to.basket[key] * mult);
      const fINR = Math.round((fLocal / rFrom) * rINR);
      const tINR = Math.round((tLocal / rTo) * rINR);
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
    const fromSavingsINR = (fromSavingsLocal / rFrom) * rINR;
    const toSavingsINR = (toSavingsLocal / rTo) * rINR;

    const globalOverview = Object.values(CITIES).map((city) => {
      const rCity = rateBundle.rates[city.currency] || FALLBACK_RATES_USD[city.currency];
      const cBasket = sumBasket(city.basket, mult);
      const cBasketUSD = cBasket / rCity;
      const multiplierVsFrom = cBasketUSD / fromBasketUSD;
      const neededLocal = salary * (cBasket / fromBasketTotal);
      const neededINR = (neededLocal / rCity) * rINR;
      return {
        id: city.id, name: city.name, flag: city.flag, currency: city.currency, symbol: city.symbol,
        costMultiplier: Number(multiplierVsFrom.toFixed(2)),
        requiredMonthlyLocal: Math.round(neededLocal),
        requiredMonthlyINR: Math.round(neededINR),
        effectiveTaxPct: Math.round(city.effectiveTaxRate * 100)
      };
    });

    res.json({
      meta: { source: rateBundle.source, updatedAt: rateBundle.updatedAt, isLive: rateBundle.isLive, lifestyle },
      from,
      to,
      exchange: {
        marketRate: Number(marketRate.toFixed(4)),
        pppRate: Number(pppExchangeRate.toFixed(4)),
        oneToInINR: Number((rINR / rTo).toFixed(2)),
        oneFromInINR: Number((rINR / rFrom).toFixed(2))
      },
      summary: {
        inputSalaryFromLocal: Math.round(salary),
        inputSalaryINR: Math.round((salary / rFrom) * rINR),
        nominalConvertedLocal: Math.round(nominalConvertedLocal),
        requiredTargetLocal: Math.round(requiredTargetLocal),
        requiredTargetAnnualLocal: Math.round(requiredTargetLocal * 12),
        requiredTargetINR: Math.round(requiredTargetINR),
        requiredTargetAnnualLPA: Number(((requiredTargetINR * 12) / 100000).toFixed(2)),
        costMultiplier: Number(costMultiplier.toFixed(2)),
        realPowerPercent: Number(realPowerPercent.toFixed(1)),
        fromBasketTotal: Math.round(fromBasketTotal),
        toBasketTotal: Math.round(toBasketTotal),
        fromBasketINR: Math.round((fromBasketTotal / rFrom) * rINR),
        toBasketINR: Math.round((toBasketTotal / rTo) * rINR)
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
    res.status(500).json({ error: 'Server failed to calculate city teleport data.' });
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`DreamCity Teleporter running at http://localhost:${PORT}`));
}

export default app;
