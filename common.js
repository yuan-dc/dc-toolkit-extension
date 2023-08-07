const KEY_SETTINGS = 'settings';
const KEY_SERVERS = 'servers';
const KEY_SITES = 'sites';

async function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(KEY_SETTINGS, (result) => {
      // console.log("Value currently is " + JSON.stringify(result));
      resolve(result[KEY_SETTINGS] || {});
    });
  });
}

async function saveSettings(data) {
  chrome.storage.local.set({ [KEY_SETTINGS]: data }, () => {
    console.log("Rules is set");
  });
}

async function getProxyServers() {
  const settings = await getSettings();
  return settings[KEY_SERVERS] || []
}

async function saveProxyServers(data) {
  const settings = await getSettings();
  saveSettings({ ...settings, [KEY_SERVERS]: data });
}

async function getSiteProxies() {
  const settings = await getSettings();
  return settings[KEY_SITES] || [];
}

async function saveSiteProxies(data) {
  const settings = await getSettings();
  saveSettings({ ...settings, [KEY_SITES]: data });
}


async function getCurrentWindow() {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent({}, (win) => {
      resolve(win);
    });
  });
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // V3
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  // let [tab] = await chrome.tabs.query(queryOptions);
  // return tab;

  // V2
  return new Promise((resolve, reject) => {
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }
      // console.error(chrome.runtime.lastError);
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      resolve(tab);
    });
  });
}

async function capture(win) {
  chrome.tabs.captureVisibleTab(win.id, {}, (dataUrl) => {
    // console.log(dataUrl);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.setAttribute('download', (new Date()).getTime() + '.jpg');
    link.click();
  });
}

async function captureFullPage(tab) {
  const code = `
  function loadScripts() {
    const sc = document.createElement('script');
    sc.defer = 'defer';
    sc.src = 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js';
    /*sc.addEventListener('load', function() {
      console.log('load html2canvas');
      capture();
    }, false);*/
    document.head.append(sc);
    sc.onload = function() {
      console.log('load html2canvas');
      console.log($);
      capture();
    }
  }
  function capture() {
    html2canvas(document.body).then(canvas => {
      console.log(canvas);
      // document.body.appendChild(canvas)
      const dataUrl = canvas.toDataURL();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.setAttribute('download', (new Date()).getTime() + '.png');
      link.click();
    });
  }
  capture();
  `;
  console.log(code);
  chrome.tabs.executeScript(tab.id, { code }, (result) => {
    console.log(result);
  });
}

async function muteTab(tab, mute) {
  chrome.tabs.update(tab.id, { muted: !!mute });  
}
