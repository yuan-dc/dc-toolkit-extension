window.onload = function() {
  init();
};

async function init() {
  const items = [];
  items.push(createProxyMenuItem({ name: '直接连接', icon: './images/multiple_stop.svg', directly: true }));
  items.push(createDidivder());

  const servers = await getProxyServers();
  if (servers && servers.length > 0) {
    for (const server of servers) {
      const el = createProxyMenuItem({ ...server, global: true, checkedIcon: './images/radio_button.svg' });
      items.push(el);
    }
    items.push(createDidivder());
  }

  const sites = await getSiteProxies();
  if (sites && sites.length > 0) {
    for (const site of sites) {
      const el = createProxyMenuItem({ ...site, checkedIcon: './images/done.svg' });
      items.push(el);
    }
    items.push(createDidivder());
  }
  
  //TODO Capture
  items.push(createOptionMenu({ name: 'Capture', icon: './images/capture.svg', onClick: async function() {
    // const tab = await getCurrentTab();
    // captureFullPage(tab);
    getCurrentWindow().then((win) => capture(win));
  }}));

  //TODO Mute
  const tab = await getCurrentTab();
  if (tab) {
    const { mutedInfo: { muted } } = tab;
    const name = `MuteTab ${muted ? 'off' : 'on'}`;
    const icon = muted ? './images/volume_up.svg' : './images/volume_off.svg';

    items.push(createOptionMenu({ name, icon, onClick: async function() {
      const tab0 = await getCurrentTab();
      const { mutedInfo: { muted } } = tab0;
      muteTab(tab0, !muted);
      window.close();
    }}));
  }

  //TODO Clear Download History
  items.push(createOptionMenu({ name: 'Clear Download History', icon: './images/mop.svg', onClick: function() {
    DownloadManager.clearHistory();
    window.close();
  } }));
  
  //TODO Clear History
  items.push(createOptionMenu({ name: 'Clear History', icon: './images/contract_delete.svg', onClick: function() {
    HistoryManager.clear();
    window.close();
  } }));
  
  items.push(createDidivder());
  items.push(createOptionMenu({ name: 'Current Proxy', icon: './images/chat_bubble.svg', onClick: async function(ev) {
    const config = await getProxySettings();
    console.log(config);
    const { value: { mode, rules } } = config;
    let message = `Mode: ${mode}`;
    if (mode === 'fixed_servers') {
      const { fallbackProxy: { scheme, host, port } } = rules;
      message += `\n${scheme}://${host}:${port}`;
    } else if (mode === 'pac_script') {

    }

    Notification.notify({
      type: 'basic',
      iconUrl: './images/public.svg',
      id: 'notify-0',
      title: 'DCProxy',
      message,
    });
  } }));

  items.push(createOptionMenu({ name: 'Reset', icon: './images/undo.svg', onClick: function(ev) {
    setProxyDirectly();
    window.close();
  } }));

  items.push(createOptionMenu({ name: '选项', icon: './images/settings.svg', onClick: function(ev) {
    chrome.tabs.create({ url: 'options.html' });
  } }));

  for (const item of items) {
    document.querySelector('.list').appendChild(item);
  }
  
  // getProxySettings().then((data) => {
  //   console.log(data);
  // })
}

function createOptionMenu(data) {
  const el = document.createElement('div');
  el.className = 'item';
  let content = '';
  if (data.icon) {
    content += `<i class="icon" style="background-image: url(\'${data.icon}\')"></i>`;
  }
  content += `<div class="item-title">${data.name}</div>`;
  el.innerHTML = content;

  function menuItemClickHandler(ev) {
    const result = data.onClick(ev);
    if (result === false) {
      return;
    }
    window.close();
  }
  if (data.onClick) {
    el.addEventListener('click', menuItemClickHandler);
  }
  return el;
}

function createDidivder() {
  const el = document.createElement('div');
  el.className = 'divider';
  return el;
}

function createProxyMenuItem(rule) {
  const { checkedIcon } = rule;
  const icon = rule.icon || './images/public.svg';
  const el = document.createElement('div');
  el.className = 'item';
  el.setAttribute('data-name', rule.name);
  el.setAttribute('data-id', rule.proxy);
  el.setAttribute('data-directly', !!rule.directly);
  if (!rule.global) {
    el.setAttribute('data-site', rule.match || '');
    el.setAttribute('data-proxy', rule.proxy || '');
  }
  let content = `<i class="icon" style="background-image: url(\'${icon}\')"></i>
      <div class="item-title" title="${rule.name}">${rule.name}</div>`;
  if (rule.selected) {
    el.className += ' active';
    content += `<div class="item-ext">
        <i class="icon-sub" style="background-image: url(\'${checkedIcon}\')"></i>
        </div>`;
  }
  el.innerHTML = content;
  el.addEventListener('click', handleProxyItemClick, false)
  return el;
}

async function handleProxyItemClick(ev) {
  const el = ev.currentTarget;
  const { name, directly, site, proxy } = el.dataset;
  const servers = await getProxyServers();
  const sites = await getSiteProxies();
  if (site) {
    const i = sites.findIndex(e => e.name === name);
    sites[i].selected = !sites[i].selected;
    saveSiteProxies(sites);
  }
  const checkedSites = sites.filter(e => e.selected);
  if (site) {
    const current = servers.find(e => e.selected);
    setProxyPacScript(current, checkedSites);
    window.close();
    return;
  }
  if (directly === 'true') {
    setProxyPacScript({}, checkedSites);

    updateServerStatus(servers);
    window.close();
    return;
  }

  const index = servers.findIndex((rule) => rule.name === name);
  // console.log(rule);
  if (index !== -1 && servers[index].proxy) {
    const rule = servers[index];
    // setProxy(rule);
    setProxyPacScript(rule, checkedSites);
    updateServerStatus(servers, index);
  }
  window.close();
}

function updateServerStatus(servers, selectedIndex = -1) {
  servers.forEach((e, i) => {
    if (i === selectedIndex) {
      e.selected = true;
    } else {
      delete e.selected;
    }
  })
  saveProxyServers(servers);
}
