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

// ============================================================================
// CLEAN FULL-PAGE VIEW (Shown when /api/rates or /api/cities is opened directly)
// ============================================================================
function renderCleanPage({ endpoint, title, subtitle, sectionTitle, visualHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — DreamCity Teleporter</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
      background: #f4f6fc; color: #0f172a; line-height: 1.5; padding-bottom: 48px;
    }
    .topbar {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: #ffffff; padding: 24px 20px;
    }
    .topbar-inner {
      max-width: 1060px; margin: 0 auto; display: flex; flex-wrap: wrap;
      align-items: center; justify-content: space-between; gap: 14px;
    }
    .badges { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .pill {
      font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 999px;
      letter-spacing: 0.04em; text-transform: uppercase;
    }
    .p-ok { background: #16a34a; color: #fff; }
    .p-path {
      background: rgba(255,255,255,0.16); color: #e0e7ff;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      text-transform: none;
    }
    h1 { font-size: 1.45rem; font-weight: 800; }
    .sub { font-size: 0.85rem; color: #c7d2fe; margin-top: 3px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn {
      background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.28);
      color: #fff; text-decoration: none; padding: 9px 14px; border-radius: 9px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
    }
    .btn:hover { background: rgba(255,255,255,0.24); }
    .wrap { max-width: 1060px; margin: 22px auto 0; padding: 0 20px; }
    .card {
      background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 22px; box-shadow: 0 8px 24px rgba(15,23,42,0.06);
    }
    .card-head {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 10px; margin-bottom: 16px;
    }
    .card-head h2 { font-size: 1.05rem; font-weight: 800; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 12px; }
    .tile {
      background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 15px;
    }
    .tile-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .code {
      font-size: 0.78rem; font-weight: 800; background: #eef2ff; color: #4f46e5;
      padding: 2px 8px; border-radius: 6px;
    }
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
        <div class="badges">
          <span class="pill p-ok">Live Data</span>
          <span class="pill p-path">${endpoint}</span>
        </div>
        <h1>${title}</h1>
        <p class="sub">${subtitle}</p>
      </div>
      <div class="actions">
        <a href="/" class="btn">← Back to DreamCity Teleporter</a>
        <a href="${endpoint === '/api/rates' ? '/api/cities' : '/api/rates'}" class="btn">
          ${endpoint === '/api/rates' ? 'View Cities Database' : 'View Live Exchange Rates'}
        </a>
      </div>
    </div>
  </header>

  <main class="wrap">
    <section class="card">
      <div class="card-head">
        <h2>${sectionTitle}</h2>
        <span class="muted">Served live from Node.js Express backend</span>
      </div>
      ${visualHtml}
    </section>
  </main>
</body>
</html>`;
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================
app.get('/api/cities', (req, res) => {
  const payload = { count: Object.keys(CITIES).length, cities: Object.values(CITIES) };
  const wantsHtml = (req.headers.accept || '').includes('text/html') && req.query.raw !== '1';
  if (!wantsHtml) return res.json(payload);

  const rows = payload.cities.map(c => {
    const b = c.basket;
    const total = b.rent + b.food + b.transport + b.utilities + b.lifestyle;
    return `<tr>
      <td><strong>${c.name}</strong>, ${c.country}</td>
      <td><span class="code">${c.currency}</span></td>
      <td class="num">${c.symbol}${c.avgTechSalary.toLocaleString()}</td>
      <td class="num">${Math.round(c.effectiveTaxRate * 100)}%</td>
      <td class="num">${c.symbol}${b.rent.toLocaleString()}</td>
      <td class="num" style="color:#4f46e5;">${c.symbol}${total.toLocaleString()}</td>
    </tr>`;
  }).join('');

  const visualHtml = `<div style="overflow-x:auto;"><table>
    <thead><tr><th>City</th><th>Currency</th><th class="num">Avg Tech Salary/mo</th><th class="num">Tax Rate</th><th class="num">1BHK Rent</th><th class="num">Total Monthly Basket</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;

  res.type('html').send(renderCleanPage({
    endpoint: '/api/cities',
    title: 'Global Tech Cities Database',
    subtitle: `${payload.count} global tech hubs with monthly living costs and tax benchmarks`,
    sectionTitle: 'Cost-of-Living & Tax Comparison Table',
    visualHtml
  }));
});

app.get('/api/rates', async (req, res) => {
  const rateBundle = await getLiveRates();
  const subset = {};
  for (const code of ['USD', 'INR', 'AED', 'SGD', 'GBP', 'EUR', 'CAD', 'JPY']) {
    subset[code] = rateBundle.rates[code] || FALLBACK_RATES_USD[code];
  }
  const payload = {
    base: rateBundle.base,
    source: rateBundle.source,
    updatedAt: rateBundle.updatedAt,
    isLive: rateBundle.isLive,
    rates: subset
  };

  const wantsHtml = (req.headers.accept || '').includes('text/html') && req.query.raw !== '1';
  if (!wantsHtml) return res.json(payload);

  const names = {
    USD: 'US Dollar', INR: 'Indian Rupee', AED: 'UAE Dirham', SGD: 'Singapore Dollar',
    GBP: 'British Pound', EUR: 'Euro', CAD: 'Canadian Dollar', JPY: 'Japanese Yen'
  };
  const inrPerUsd = subset.INR || 85;
  const cards = Object.entries(subset).map(([code, perUsd]) => {
    const inrVal = inrPerUsd / perUsd;
    const headline = code === 'INR' ? `₹${inrPerUsd.toFixed(2)} / $1` : `1 ${code} = ₹${inrVal.toFixed(2)}`;
    const detail = code === 'USD' ? 'Global Base Currency' : `1 USD = ${perUsd.toFixed(4)} ${code}`;
    return `<div class="tile">
      <div class="tile-top"><span class="muted" style="font-weight:700;">${names[code] || code}</span><span class="code">${code}</span></div>
      <div class="big">${headline}</div>
      <div class="muted">${detail}</div>
    </div>`;
  }).join('');

  res.type('html').send(renderCleanPage({
    endpoint: '/api/rates',
    title: 'Live Global Exchange Rates',
    subtitle: `${payload.source} • Updated ${payload.updatedAt}`,
    sectionTitle: 'Today\'s Currency Conversion Rates (vs. INR & USD)',
    visualHtml: `<div class="grid">${cards}</div>`
  }));
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
