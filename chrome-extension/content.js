// MyLine CS2 — HLTV Stats Extractor
// Roda em páginas de partida do HLTV

(function() {
  'use strict';

  window.mylineExtractStats = function() {
    const result = {
      matchUrl: window.location.href,
      matchId: window.location.pathname.split('/')[2] || '',
      teams: [],
      players: [],
      error: null,
    };

    try {
      // ── Nomes dos times ──
      const teamNames = [...document.querySelectorAll('.teamName')].map(el => el.textContent?.trim());

      // ── Placar ──
      const scores = [...document.querySelectorAll('.lost, .won')].map(el => el.textContent?.trim());

      // ── Tabela de stats dos jogadores ──
      // HLTV usa .statsTable ou .table-container
      const tables = document.querySelectorAll('.stats-table, .playerEntry, [class*="stats"]');

      // Abordagem robusta: busca todas as linhas de jogadores
      const playerRows = [];

      // Método 1: Match scoreboard
      const scoreboardRows = document.querySelectorAll('.matchplayers .player, .scoreboard .player-row');
      scoreboardRows.forEach(row => {
        const nick     = row.querySelector('.nick, .player-nick')?.textContent?.trim();
        const kills    = row.querySelector('.kills, [data-stat="kills"]')?.textContent?.trim();
        const deaths   = row.querySelector('.deaths, [data-stat="deaths"]')?.textContent?.trim();
        const assists  = row.querySelector('.assists, [data-stat="assists"]')?.textContent?.trim();
        const adr      = row.querySelector('.adr, [data-stat="adr"]')?.textContent?.trim();
        const rating   = row.querySelector('.rating, [data-stat="rating2"]')?.textContent?.trim();
        if (nick) playerRows.push({ nick, kills, deaths, assists, adr, rating });
      });

      // Método 2: Stats page (hltv.org/stats/matches/...)
      const statsRows = document.querySelectorAll('.stats-table tbody tr');
      statsRows.forEach(row => {
        const cells   = row.querySelectorAll('td');
        if (cells.length < 6) return;
        const nick    = cells[0]?.querySelector('.player-nick, a')?.textContent?.trim();
        const kills   = cells[1]?.textContent?.trim();
        const deaths  = cells[2]?.textContent?.trim();
        const assists = cells[3]?.textContent?.trim();
        const adr     = cells[4]?.textContent?.trim();
        const rating  = cells[5]?.textContent?.trim();
        if (nick) playerRows.push({ nick, kills, deaths, assists, adr, rating });
      });

      if (playerRows.length === 0) {
        result.error = 'Nenhum dado encontrado. Tente na página de stats da partida.';
      }

      // ── Formata para CSV ──
      result.players = playerRows.map(p => ({
        nickname:    p.nick || '',
        kills:       parseInt(p.kills) || 0,
        deaths:      parseInt(p.deaths) || 0,
        assists:     parseInt(p.assists) || 0,
        adr:         parseFloat(p.adr) || 0,
        rating:      parseFloat(p.rating) || 0,
        entry_kills: 0,   // Preencher manualmente
        clutches:    0,   // Preencher manualmente
        mvp:         0,   // 1 para o MVP, 0 para os demais
        won:         0,   // 1 se o time venceu, 0 se perdeu
      }));

      result.teams = teamNames;

    } catch (e) {
      result.error = String(e);
    }

    return result;
  };

  // Notifica que o extractor está pronto
  window.postMessage({ type: 'MYLINE_READY' }, '*');
})();
