// Smart natural-language query parser for VoltMart AI search.
// No external LLM needed for MVP: robust regex + keyword mapping covers 90% of user intents
// like "esp32 with camera under 1000", "cheap arduino kits", "raspberry pi 5 8gb", etc.

const CATEGORY_KEYWORDS = {
  arduino: ['arduino', 'uno', 'mega', 'nano'],
  esp32: ['esp32', 'esp8266', 'nodemcu', 'wifi board', 'espressif'],
  'raspberry-pi': ['raspberry pi', 'rpi', 'raspi', 'pi 5', 'pi 4', 'pi zero'],
  sensors: ['sensor', 'dht', 'ultrasonic', 'pir', 'gyro', 'accelerometer', 'humidity', 'temperature'],
  modules: ['module', 'driver', 'rfid', 'gps', 'bluetooth'],
  motors: ['motor', 'servo', 'stepper', 'dc motor'],
  robotics: ['robot', 'chassis', 'arm', 'hexapod', 'humanoid'],
  iot: ['iot', 'smart', 'connected', 'wifi kit'],
  'dev-boards': ['dev board', 'development board', 'nucleo', 'stm32', 'teensy', 'blue pill'],
  power: ['power supply', 'adapter', 'psu', 'buck', 'boost', 'converter'],
  batteries: ['battery', 'lipo', 'li-ion', 'lithium', '18650', 'cell'],
  displays: ['display', 'oled', 'lcd', 'tft', 'screen', 'touchscreen'],
  tools: ['soldering', 'multimeter', 'breadboard', 'jumper', 'tool'],
  '3d-printing': ['3d print', 'filament', 'pla', 'abs', 'petg', 'ender', 'bambu'],
  drones: ['drone', 'quadcopter', 'fpv', 'uav', 'multirotor'],
  automation: ['automation', 'smart home', 'relay', 'home kit'],
  'ai-hardware': ['jetson', 'coral', 'edge ai', 'ai accelerator', 'tpu', 'nvidia', 'ml'],
  embedded: ['embedded', 'microcontroller', 'mcu'],
  'stem-kits': ['stem', 'learning kit', 'education', 'kids', 'student'],
};

const BRAND_KEYWORDS = {
  arduino: ['arduino'],
  'raspberry-pi': ['raspberry pi', 'raspberry'],
  espressif: ['espressif', 'esp32', 'esp8266'],
  stmicro: ['stm', 'stmicro', 'stmicroelectronics'],
  'texas-instruments': ['texas', 'ti'],
  nvidia: ['nvidia', 'jetson', 'coral'],
  seeed: ['seeed', 'seeed studio'],
  adafruit: ['adafruit'],
  sparkfun: ['sparkfun'],
  dji: ['dji'],
};

export function parseQuery(raw) {
  if (!raw || !raw.trim()) return { filter: {}, keywords: [], intent: 'browse' };
  const q = raw.toLowerCase().replace(/[₹,]/g, '').trim();
  const filter = {};
  const foundKeywords = [];

  // Price range: "under 1000", "below 500", "less than 2000", "under ₹1000"
  const under = q.match(/(?:under|below|less than|<)\s*(\d+)(?:\s*(?:rs|rupees|inr))?/);
  if (under) filter.maxPrice = parseInt(under[1]) * (under[1].length <= 3 && parseInt(under[1]) < 100 ? 1000 : 1);
  const above = q.match(/(?:above|over|more than|>)\s*(\d+)/);
  if (above) filter.minPrice = parseInt(above[1]);
  const between = q.match(/between\s*(\d+)\s*(?:and|to|-)\s*(\d+)/);
  if (between) { filter.minPrice = parseInt(between[1]); filter.maxPrice = parseInt(between[2]); }

  // Category detection
  for (const [slug, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(k => q.includes(k))) { filter.category = slug; break; }
  }
  // Brand detection
  for (const [slug, kws] of Object.entries(BRAND_KEYWORDS)) {
    if (kws.some(k => q.includes(k))) { filter.brand = slug; break; }
  }

  // Intent modifiers
  if (/cheap|cheapest|budget|affordable|low cost/.test(q)) { filter._sort = 'price-low'; }
  if (/best|top|highest rated|popular/.test(q)) { filter._sort = 'rating'; }
  if (/latest|newest|new/.test(q)) { filter._sort = 'newest'; }
  if (/deal|sale|discount|offer/.test(q)) filter.deal = 'true';

  // Extract remaining keywords for text search
  const cleaned = q.replace(/(?:under|below|less than|above|over|more than|between)\s*\d+(?:\s*(?:and|to|-)\s*\d+)?(?:\s*(?:rs|rupees|inr))?/g, '');
  const words = cleaned.split(/\s+/).filter(w => w.length > 2 && !['with', 'and', 'the', 'for', 'have', 'has', 'which', 'that', 'from'].includes(w));
  if (words.length) foundKeywords.push(...words);

  const humanSummary = buildSummary(filter, foundKeywords);
  return { filter, keywords: foundKeywords, intent: 'search', summary: humanSummary };
}

function buildSummary(filter, keywords) {
  const parts = [];
  if (filter.brand) parts.push(filter.brand);
  if (filter.category) parts.push(filter.category.replace('-', ' '));
  if (filter.maxPrice && filter.minPrice) parts.push(`₹${filter.minPrice}-₹${filter.maxPrice}`);
  else if (filter.maxPrice) parts.push(`under ₹${filter.maxPrice}`);
  else if (filter.minPrice) parts.push(`above ₹${filter.minPrice}`);
  if (filter._sort === 'price-low') parts.push('budget');
  if (filter._sort === 'rating') parts.push('top rated');
  return `Found products matching: ${parts.length ? parts.join(' · ') : keywords.join(' ')}`;
}
