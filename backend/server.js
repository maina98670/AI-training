const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint — frontend calls this, server calls HF
app.post('/api/infer', async (req, res) => {
  const { token, modelId, payload } = req.body;

  if (!token || !modelId || !payload) {
    return res.status(400).json({ error: 'Missing token, modelId, or payload' });
  }

  try {
    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await hfRes.json();
    res.status(hfRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify token endpoint
app.post('/api/verify', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'No token provided' });

  try {
    const r = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CDSS Eval Lab running on port ${PORT}`));
