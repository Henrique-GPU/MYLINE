let extractedData = null;

function setStatus(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<div class="status ${type}">${msg}</div>`;
}

function playersToCSV(players) {
  const header = 'nickname,kills,deaths,assists,rating,adr,entry_kills,clutches,mvp,won';
  const rows = players.map(p =>
    `${p.nickname},${p.kills},${p.deaths},${p.assists},${p.rating},${p.adr},${p.entry_kills},${p.clutches},${p.mvp},${p.won}`
  );
  return [header, ...rows].join('\n');
}

document.getElementById('btn-extract').addEventListener('click', async () => {
  setStatus('status-extract', 'info', '⏳ Extraindo dados...');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url?.includes('hltv.org')) {
    setStatus('status-extract', 'error', '❌ Acesse uma página de partida no HLTV primeiro.');
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.mylineExtractStats?.() || null,
    });

    const data = results?.[0]?.result;

    if (!data) {
      setStatus('status-extract', 'error', '❌ Extractor não carregou. Recarregue a página do HLTV.');
      return;
    }

    if (data.error) {
      setStatus('status-extract', 'error', `❌ ${data.error}`);
      return;
    }

    if (!data.players || data.players.length === 0) {
      setStatus('status-extract', 'error', '❌ Nenhum jogador encontrado. Tente na aba Stats da partida.');
      return;
    }

    extractedData = data;

    // Mostra preview
    const section = document.getElementById('players-section');
    const list = document.getElementById('players-list');
    const title = document.getElementById('players-title');
    section.style.display = 'block';
    title.textContent = `${data.players.length} jogadores encontrados`;

    list.innerHTML = data.players.map(p => `
      <div class="player-row">
        <span class="player-nick">${p.nickname}</span>
        <span class="player-stat green">${p.kills}</span>
        <span class="player-stat">${p.deaths}</span>
        <span class="player-stat">${p.adr}</span>
        <span class="player-stat" style="color: ${p.rating > 1.10 ? '#00d4ff' : '#5a6e90'}">${p.rating}</span>
      </div>
    `).join('');

    setStatus('status-extract', 'success', `✅ ${data.players.length} jogadores extraídos. Lembre de preencher MVP, entry kills, clutches e won manualmente.`);

  } catch (e) {
    setStatus('status-extract', 'error', `❌ Erro: ${e.message}`);
  }
});

document.getElementById('btn-open-hltv').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.hltv.org/matches' });
});

document.getElementById('btn-copy-csv').addEventListener('click', async () => {
  if (!extractedData?.players?.length) {
    setStatus('status-extract', 'error', '❌ Extraia os dados primeiro.');
    return;
  }
  const csv = playersToCSV(extractedData.players);
  await navigator.clipboard.writeText(csv);
  setStatus('status-extract', 'success', '✅ CSV copiado! Cole no Admin Panel → Importar Stats.');
});

document.getElementById('btn-copy-json').addEventListener('click', async () => {
  if (!extractedData?.players?.length) {
    setStatus('status-extract', 'error', '❌ Extraia os dados primeiro.');
    return;
  }
  await navigator.clipboard.writeText(JSON.stringify(extractedData.players, null, 2));
  setStatus('status-extract', 'success', '✅ JSON copiado!');
});
