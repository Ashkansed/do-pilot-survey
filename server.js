const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RESPONSES_FILE)) {
  fs.writeFileSync(RESPONSES_FILE, '[]');
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readResponses() {
  return JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8'));
}

function writeResponses(responses) {
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2));
}

function getBaseUrl(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('x-forwarded-host') || req.get('host');
  return `${proto}://${host}`;
}

app.post('/api/submit', (req, res) => {
  const responses = readResponses();
  const entry = {
    id: uuidv4(),
    submittedAt: new Date().toISOString(),
    ...req.body,
  };
  responses.push(entry);
  writeResponses(responses);
  res.json({ success: true, id: entry.id });
});

app.get('/api/responses', (_req, res) => {
  res.json(readResponses());
});

app.get('/api/responses/csv', (_req, res) => {
  const responses = readResponses();
  if (responses.length === 0) {
    res.setHeader('Content-Type', 'text/csv');
    res.send('No responses yet');
    return;
  }

  const flat = responses.map((r) => flattenResponse(r));
  const headers = [...new Set(flat.flatMap((r) => Object.keys(r)))];
  const rows = flat.map((r) =>
    headers.map((h) => escapeCsv(r[h] ?? '')).join(',')
  );
  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="survey-responses.csv"');
  res.send(csv);
});

app.get('/api/qr', async (req, res) => {
  const url = `${getBaseUrl(req)}/`;
  try {
    const png = await QRCode.toBuffer(url, {
      width: 400,
      margin: 2,
      color: { dark: '#1a365d', light: '#ffffff' },
    });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/api/share-info', (req, res) => {
  res.json({
    surveyUrl: `${getBaseUrl(req)}/`,
    shareUrl: `${getBaseUrl(req)}/share.html`,
    qrUrl: `${getBaseUrl(req)}/api/qr`,
  });
});

function flattenResponse(r) {
  const flat = { id: r.id, submittedAt: r.submittedAt };
  for (const [key, value] of Object.entries(r)) {
    if (key === 'id' || key === 'submittedAt') continue;
    if (Array.isArray(value)) {
      flat[key] = value.join('; ');
    } else if (typeof value === 'object' && value !== null) {
      for (const [k, v] of Object.entries(value)) {
        flat[`${key}.${k}`] = v;
      }
    } else {
      flat[key] = value;
    }
  }
  return flat;
}

function escapeCsv(val) {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

app.listen(PORT, () => {
  console.log(`DO Pilot Survey running at http://localhost:${PORT}`);
  console.log(`Share page (QR code): http://localhost:${PORT}/share.html`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin.html`);
});
