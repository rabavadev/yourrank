/**
 * YourRank Telegram Bot Workspace Client Script
 */

(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function toast(msg) {
    const t = $('status');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast';
    t.hidden = false;
    clearTimeout(t._toastTimeout);
    t._toastTimeout = setTimeout(() => { t.hidden = true; }, 4000);
  }

  async function api(method, path, body) {
    try {
      const res = await fetch('/bot/dash/api' + path, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401) {
        return null;
      }
      return await res.json();
    } catch (e) {
      console.warn('[telegram api error]', e);
      return null;
    }
  }

  // --- Stepper Helper ---
  function setStepperStep(stepNum) {
    document.querySelectorAll('.tg-stepper-item').forEach((el) => {
      const ind = parseInt(el.getAttribute('data-step-indicator'), 10);
      if (ind === stepNum) {
        el.classList.add('is-active');
      } else if (ind < stepNum) {
        el.classList.remove('is-active');
        el.classList.add('is-completed');
      } else {
        el.classList.remove('is-active', 'is-completed');
      }
    });
  }

  // --- Telegram Overview Page ---
  async function initOverview() {
    const data = await api('GET', '/overview');
    if (!data) return;
    if ($('totClicks')) $('totClicks').textContent = data.clicks ?? '0';
    if ($('totUnique')) $('totUnique').textContent = data.unique ?? '0';
    if ($('totSubs')) $('totSubs').textContent = data.subscribers ?? '0';
    if ($('totOffers')) $('totOffers').textContent = data.offers ?? '0';

    if ($('ovBots')) {
      const bots = data.bots || [];
      if (!bots.length) {
        $('ovBots').innerHTML = '<div class="p-12 bg-panel radius-md border text-center"><p class="muted text-xs m-0">No bots connected yet. <a href="/dashboard/telegram/bots">Connect one now →</a></p></div>';
      } else {
        $('ovBots').innerHTML = bots.map((b) => `<div class="d-flex justify-between items-center p-12 border-b"><div><b>@${esc(b.bot_username)}</b><div class="muted text-xs">•••• ${esc(b.token_last4 || '')}</div></div><span class="v3-chip v3-chip--fulfilled">● Active</span></div>`).join('');
      }
    }

    if ($('ovOffers')) {
      const offers = data.topOffers || [];
      if (!offers.length) {
        $('ovOffers').innerHTML = '<div class="p-12 bg-panel radius-md border text-center"><p class="muted text-xs m-0">No offers yet. <a href="/dashboard/telegram/offers">Create an offer →</a></p></div>';
      } else {
        $('ovOffers').innerHTML = offers.map((o) => `<div class="d-flex justify-between items-center p-12 border-b"><div><b>${esc(o.casino)}</b><div class="muted text-xs">${esc(o.label)}</div></div><b>${o.clicks || 0} clicks</b></div>`).join('');
      }
    }
  }

  // --- Telegram Bots Page ---
  async function initBots() {
    const bots = await api('GET', '/bots');
    const listEl = $('botList');
    const planStateEl = $('botPlanState');
    if (!listEl) return;

    const count = (bots && bots.length) || 0;
    const connectedWidget = $('connectedBotsWidget');
    const wizardWidget = $('connectWizardWidget');
    const wizardTitle = $('wizardTitle');
    const wizardSub = $('wizardSub');

    if (planStateEl) {
      planStateEl.textContent = `${count} / 1 Bots connected`;
    }

    if (!bots || !bots.length) {
      if (connectedWidget) connectedWidget.hidden = true;
      if (wizardWidget) wizardWidget.hidden = false;
      if (wizardTitle) wizardTitle.textContent = "Connect a Telegram bot";
      if (wizardSub) wizardSub.textContent = "Automate chat replies, send stream live alerts, and share sponsor deals";
      listEl.innerHTML = '';
    } else {
      if (connectedWidget) connectedWidget.hidden = false;
      if (count >= 1) {
        if (wizardWidget) wizardWidget.hidden = true;
      } else {
        if (wizardWidget) wizardWidget.hidden = false;
        if (wizardTitle) wizardTitle.textContent = "Connect another bot";
      }

      listEl.innerHTML = bots.map((b) => `
        <div class="card p-20 mb-12 d-flex justify-between items-center flex-wrap gap-12">
          <div class="d-flex items-center gap-12">
            <div class="bot-quick-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            </div>
            <div>
              <h3 class="m-0 text-base font-600"><a href="https://t.me/${esc(b.bot_username)}" target="_blank" rel="noopener">@${esc(b.bot_username)} ↗</a></h3>
              <p class="muted text-xs mt-2 m-0">Token: <code>•••• ${esc(b.token_last4 || '')}</code> · Active &amp; responding</p>
            </div>
          </div>
          <div class="d-flex gap-8 items-center">
            <span class="v3-chip v3-chip--fulfilled">● Live &amp; Connected</span>
            <button class="btn btn--sm btn--ghost" data-action="openTestModal" data-bot-name="${esc(b.bot_username)}" data-bot-id="${esc(b.id)}">Test message</button>
            <button class="btn btn--sm btn--danger" data-del-bot="${esc(b.id)}">Disconnect</button>
          </div>
        </div>
      `).join('');
    }

    // Toggle token visibility
    const toggleTokenBtn = document.querySelector('[data-action="toggleToken"]');
    if (toggleTokenBtn) {
      toggleTokenBtn.addEventListener('click', () => {
        const inp = $('botToken');
        if (!inp) return;
        if (inp.type === 'password') {
          inp.type = 'text';
          toggleTokenBtn.textContent = 'Hide';
        } else {
          inp.type = 'password';
          toggleTokenBtn.textContent = 'Show';
        }
      });
    }

    // Paste token from clipboard
    const pasteTokenBtn = document.querySelector('[data-action="pasteToken"]');
    if (pasteTokenBtn) {
      pasteTokenBtn.addEventListener('click', async () => {
        const inp = $('botToken');
        if (!inp) return;
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text) {
              inp.value = text.trim();
              toast('Token pasted from clipboard');
            }
          }
        } catch {
          inp.focus();
        }
      });
    }

    // Wizard Next / Prev Buttons
    document.querySelectorAll('[data-action="wizardNext"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step1 = document.querySelector('.wizard-step[data-step="1"]');
        const step2 = document.querySelector('.wizard-step[data-step="2"]');
        if (step1 && step2) {
          step1.hidden = true;
          step2.hidden = false;
          setStepperStep(2);
        }
      });
    });

    document.querySelectorAll('[data-action="wizardPrev"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step1 = document.querySelector('.wizard-step[data-step="1"]');
        const step2 = document.querySelector('.wizard-step[data-step="2"]');
        if (step1 && step2) {
          step1.hidden = false;
          step2.hidden = true;
          setStepperStep(1);
        }
      });
    });

    // Connect Bot Button
    const connectBtn = document.querySelector('[data-action="connectBot"]');
    if (connectBtn) {
      connectBtn.addEventListener('click', async () => {
        const tokenInput = $('botToken');
        const welcomeInput = $('botWelcome');
        const token = tokenInput ? tokenInput.value.trim() : '';
        const welcome = welcomeInput ? welcomeInput.value.trim() : '';
        if (!token) {
          toast('Please paste your bot token');
          if (tokenInput) tokenInput.focus();
          return;
        }

        const step1 = document.querySelector('.wizard-step[data-step="1"]');
        const step3 = document.querySelector('.wizard-step[data-step="3"]');
        if (step1 && step3) {
          step1.hidden = true;
          step3.hidden = false;
          setStepperStep(3);
        }

        const res = await api('POST', '/bots', { token, welcome_message: welcome });
        if (res && res.ok) {
          toast('Bot connected successfully!');
          if (step3) step3.hidden = true;
          if (step1) step1.hidden = false;
          setStepperStep(1);
          initBots();
        } else {
          toast(res?.error || 'Failed to connect bot. Please verify your token.');
          if (step3) step3.hidden = true;
          if (step1) step1.hidden = false;
          setStepperStep(1);
        }
      });
    }

    // Open Test Message Panel
    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="openTestModal"]');
      if (!btn) return;
      const botName = btn.getAttribute('data-bot-name');
      const testPanel = $('testMsgPanel');
      if (testPanel) {
        testPanel.hidden = false;
        if ($('tmBotName')) $('tmBotName').textContent = `@${botName}`;
        testPanel.scrollIntoView({ behavior: 'smooth' });
      }
    });

    const cancelTestBtn = document.querySelector('[data-action="cancelTestMessage"]');
    if (cancelTestBtn) {
      cancelTestBtn.addEventListener('click', () => {
        const testPanel = $('testMsgPanel');
        if (testPanel) testPanel.hidden = true;
      });
    }

    // Disconnect bot
    listEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-del-bot]');
      if (!btn) return;
      const botId = btn.getAttribute('data-del-bot');
      if (!confirm('Are you sure you want to disconnect this bot?')) return;
      const res = await api('DELETE', `/bots/${botId}`);
      if (res && res.ok) {
        toast('Bot disconnected');
        initBots();
      } else {
        toast('Failed to disconnect bot');
      }
    });
  }

  // --- Telegram Commands Page ---
  async function initCommands() {
    const bots = await api('GET', '/bots');
    const select = $('botSelect');
    const nameEl = $('selectedBotName');
    const welcomeInput = $('welcomeMsg');
    const cmdList = $('cmdList');
    if (!select) return;

    if (!bots || !bots.length) {
      select.innerHTML = '<option value="">No bots connected</option>';
      if (nameEl) nameEl.textContent = 'No bot selected';
      if (cmdList) cmdList.innerHTML = '<div class="p-16 bg-panel border radius-md"><p class="muted text-xs m-0">Connect a bot in <a href="/dashboard/telegram/bots">Bots</a> to customize replies and commands.</p></div>';
      return;
    }

    select.innerHTML = bots.map((b) => `<option value="${esc(b.id)}">@${esc(b.bot_username)}</option>`).join('');
    
    async function loadBotCommands(botId) {
      const selectedBot = bots.find((b) => String(b.id) === String(botId)) || bots[0];
      if (nameEl && selectedBot) nameEl.textContent = `@${selectedBot.bot_username}`;
      if (welcomeInput && selectedBot) welcomeInput.value = selectedBot.welcome_message || '';

      const commands = await api('GET', `/commands?bot_id=${botId}`);
      if (!cmdList) return;
      if (!commands || !commands.length) {
        cmdList.innerHTML = '<div class="p-16 bg-panel border radius-md"><p class="muted text-xs m-0">No custom commands added yet. Use the form above to add slash commands.</p></div>';
      } else {
        cmdList.innerHTML = commands.map((c) => `
          <div class="tg-command-item">
            <div>
              <b class="text-sm font-mono">/${esc(c.command)}</b>
              <p class="muted text-xs m-0 mt-2">${esc(c.response_text || '')}</p>
              ${c.button_label ? `<span class="v3-chip mt-4 text-xs">${esc(c.button_label)} ↗</span>` : ''}
            </div>
            <button class="btn btn--xs btn--danger" data-del-cmd="${esc(c.id)}">Delete</button>
          </div>
        `).join('');
      }
    }

    select.addEventListener('change', () => loadBotCommands(select.value));
    loadBotCommands(select.value);

    // Save Welcome Message
    const saveWelcomeBtn = document.querySelector('[data-action="saveWelcome"]');
    if (saveWelcomeBtn) {
      saveWelcomeBtn.addEventListener('click', async () => {
        const botId = select.value;
        const msg = welcomeInput?.value.trim() || '';
        if (!botId) return;
        saveWelcomeBtn.disabled = true;
        const res = await api('PATCH', `/bots/${botId}`, { welcome_message: msg });
        saveWelcomeBtn.disabled = false;
        if (res && res.ok) {
          toast('Welcome message saved!');
        } else {
          toast(res?.error || 'Failed to save welcome message');
        }
      });
    }

    // Add Custom Command
    const addCmdBtn = document.querySelector('[data-action="addCommand"]');
    if (addCmdBtn) {
      addCmdBtn.addEventListener('click', async () => {
        const botId = select.value;
        const name = $('cmdName')?.value.trim().replace(/^\//, '');
        const resp = $('cmdResp')?.value.trim();
        const btnLabel = $('cmdBtnLabel')?.value.trim();
        const btnUrl = $('cmdBtnUrl')?.value.trim();
        if (!botId || !name || !resp) {
          toast('Please enter a command name and reply text');
          return;
        }
        addCmdBtn.disabled = true;
        const res = await api('POST', '/commands', { bot_id: botId, command: name, response_text: resp, button_label: btnLabel, button_url: btnUrl });
        addCmdBtn.disabled = false;
        if (res && res.ok) {
          toast('Command added!');
          $('cmdName').value = '';
          $('cmdResp').value = '';
          if ($('cmdBtnLabel')) $('cmdBtnLabel').value = '';
          if ($('cmdBtnUrl')) $('cmdBtnUrl').value = '';
          loadBotCommands(botId);
        } else {
          toast(res?.error || 'Failed to add command');
        }
      });
    }

    // Delete Command
    if (cmdList) {
      cmdList.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-del-cmd]');
        if (!btn) return;
        const id = btn.getAttribute('data-del-cmd');
        if (!confirm('Delete this command?')) return;
        const res = await api('DELETE', `/commands/${id}`);
        if (res && res.ok) {
          toast('Command deleted');
          loadBotCommands(select.value);
        } else {
          toast('Failed to delete command');
        }
      });
    }
  }

  // --- Telegram Offers Page ---
  async function initOffers() {
    const offers = await api('GET', '/offers');
    const tbody = $('offers');
    if (!tbody) return;

    if (!offers || !offers.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="muted">No offers yet. Create your first offer below.</td></tr>';
    } else {
      tbody.innerHTML = offers.map((o) => `
        <tr>
          <td><b>${esc(o.casino)}</b><br><span class="muted text-xs">${esc(o.label)}</span></td>
          <td><code>${esc(o.slug || '')}</code></td>
          <td class="ta-r num">${o.clicks || 0}</td>
          <td class="ta-r num">${o.unique_clicks || 0}</td>
          <td><span class="v3-chip ${o.active ? 'v3-chip--fulfilled' : 'v3-chip--cancelled'}">${o.active ? 'Active' : 'Paused'}</span></td>
          <td class="ta-r"><button class="btn btn--sm" data-toggle-offer="${esc(o.id)}" data-active="${o.active ? '1' : '0'}">${o.active ? 'Pause' : 'Activate'}</button></td>
        </tr>
      `).join('');
    }

    const createBtn = document.querySelector('[data-action="createOffer"]');
    if (createBtn) {
      createBtn.addEventListener('click', async () => {
        const casino = $('oCasino')?.value.trim();
        const label = $('oLabel')?.value.trim();
        const url = $('oUrl')?.value.trim();
        const code = $('oCode')?.value.trim();
        const bonus = $('oBonus')?.value.trim();
        if (!casino || !label || !url) {
          toast('Please fill in Casino, Label, and Affiliate URL');
          return;
        }
        createBtn.disabled = true;
        const res = await api('POST', '/offers', { casino, label, destination_url: url, promo_code: code, bonus_text: bonus });
        createBtn.disabled = false;
        if (res && res.ok) {
          toast('Offer created!');
          $('oCasino').value = '';
          $('oLabel').value = '';
          $('oUrl').value = '';
          $('oCode').value = '';
          $('oBonus').value = '';
          initOffers();
        } else {
          toast(res?.error || 'Failed to create offer');
        }
      });
    }

    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-toggle-offer]');
      if (!btn) return;
      const id = btn.getAttribute('data-toggle-offer');
      const active = btn.getAttribute('data-active') === '1';
      const res = await api('PATCH', `/offers/${id}`, { active: !active });
      if (res && res.ok) {
        toast(active ? 'Offer paused' : 'Offer activated');
        initOffers();
      }
    });
  }

  // --- Telegram Broadcasts Page ---
  async function initBroadcasts() {
    const bots = await api('GET', '/bots');
    const select = $('bcBotSelect');
    const historyEl = $('bcHistory');
    if (!select) return;

    if (!bots || !bots.length) {
      select.innerHTML = '<option value="">No bots connected</option>';
    } else {
      select.innerHTML = bots.map((b) => `<option value="${esc(b.id)}">@${esc(b.bot_username)}</option>`).join('');
    }

    const broadcasts = await api('GET', '/broadcasts');
    if (historyEl) {
      if (!broadcasts || !broadcasts.length) {
        historyEl.innerHTML = '<div class="p-16 bg-panel border radius-md"><p class="muted text-xs m-0">No past broadcasts found.</p></div>';
      } else {
        historyEl.innerHTML = broadcasts.map((bc) => `
          <div class="card p-16 mb-12 d-flex justify-between items-center">
            <div>
              <p class="m-0 text-sm">${esc(bc.message || '')}</p>
              <span class="muted text-xs mt-4 d-block">${esc(new Date(bc.created_at).toLocaleString())}</span>
            </div>
            <span class="v3-chip v3-chip--fulfilled">Sent (${bc.sent_count || 0})</span>
          </div>
        `).join('');
      }
    }

    const sendBtn = document.querySelector('[data-action="sendBroadcast"]');
    if (sendBtn) {
      sendBtn.addEventListener('click', async () => {
        const botId = select.value;
        const msg = $('bcBody')?.value.trim();
        const img = $('bcImage')?.value.trim();
        if (!botId || !msg) {
          toast('Please select a bot and enter a broadcast message');
          return;
        }
        sendBtn.disabled = true;
        const res = await api('POST', '/broadcasts', { bot_id: botId, message: msg, image_url: img });
        sendBtn.disabled = false;
        if (res && res.ok) {
          toast('Broadcast dispatched to subscribers!');
          $('bcBody').value = '';
          if ($('bcImage')) $('bcImage').value = '';
          initBroadcasts();
        } else {
          toast(res?.error || 'Failed to send broadcast');
        }
      });
    }
  }

  // --- Router / Tab Init ---
  document.addEventListener('DOMContentLoaded', () => {
    const tgApp = $('tg-app');
    if (!tgApp) return;
    const tab = tgApp.getAttribute('data-tg-tab') || 'overview';
    if (tab === 'overview') initOverview();
    else if (tab === 'bots') initBots();
    else if (tab === 'commands') initCommands();
    else if (tab === 'offers') initOffers();
    else if (tab === 'broadcasts') initBroadcasts();
  });
})();
