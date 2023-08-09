
async function getProxySettings() {
  return new Promise((resolve, reject) => {
    chrome.proxy.settings.get({ incognito: false }, (details) => {
      // console.log(details);
      resolve(details);
    });
  });
}

async function clearProxySettings() {
  chrome.proxy.settings.clear({ scope: 'regular' });
}

function setProxy(rule) {
  const { proxy, excludes = [] } = rule;
  const scheme = proxy.substring(0, proxy.indexOf(':'));
  const host = proxy.substring(proxy.indexOf(':') + 3, proxy.lastIndexOf(':'));
  const port = Number.parseInt(proxy.substring(proxy.lastIndexOf(':') + 1));

  const config = {
    mode: "fixed_servers",
    rules: {
      fallbackProxy: {
        scheme,
        host,
        port
      },
      bypassList: [...excludes],
    },
  };
  chrome.proxy.settings.set(
    { value: config, scope: 'regular' },
    function() {
      console.log('Set proxy server completed');
    }
  );
}

function getProxyUrl(proxyServer) {
  if (!proxyServer) {
    return 'DIRECT';
  }
  var scheme = proxyServer.substring(0, proxyServer.indexOf(':'));
  var server = proxyServer.substring(proxyServer.indexOf('://') + 3);
  scheme = scheme.toUpperCase();
  if (scheme.indexOf('SOCKS') !== -1) {
    return scheme + ' ' + server;
  }
  return 'PROXY ' + server;
}

function setProxyPacScript(globalProxy, sites) {
  let pac_script = `
function FindProxyForURL(url, host) {
  var globalProxy = ${JSON.stringify(globalProxy || {})};
  var siteConfigs = ${JSON.stringify(sites || [])};

  function getProxyUrl(proxyServer) {
    if (!proxyServer) {
      return 'DIRECT';
    }
    var scheme = proxyServer.substring(0, proxyServer.indexOf(':'));
    var server = proxyServer.substring(proxyServer.indexOf('://') + 3);
    scheme = scheme.toUpperCase();
    if (scheme.indexOf('SOCKS') !== -1) {
      return scheme + ' ' + server;
    }
    return 'PROXY ' + server;
  }

  function matchPattern(host, reg) {
    reg = reg.replace(/\\./g, '\\\\.').replace(/\\*/g, '\\.+');
    var regx = new RegExp(reg, 'i');
    return regx.test(host);
  }

  function getMatchedSite($host) {
    var item = null;
    for (var i in siteConfigs) {
      if (matchPattern($host, siteConfigs[i].match)) {
        item = siteConfigs[i];
        break;
      }
    }
    return item;
  }

  function isExclude(url, host) {
    var excludes = globalProxy.excludes || [];
    for (var i in excludes) {
      if (excludes[i] === host) {
        return true;
      }
    }
    return false;
  }
  
  var siteProxy = getMatchedSite(host);
  if (siteProxy) {
    return getProxyUrl(siteProxy.proxy);
  }
  var exclude = isExclude(url, host);
  if (globalProxy.proxy && !exclude) {
    return getProxyUrl(globalProxy.proxy);
  }
  return 'DIRECT';
}`;
  const config = {
    mode: "pac_script",
    pacScript: {
      data: pac_script,
    },
  };
  chrome.proxy.settings.set({value: config, scope: 'regular'},
    function() {
      console.log('Set proxy server completed')
    });
}

async function setProxyDirectly() {
  clearProxySettings();

  const rules = await getProxyServers();
  const values = rules.map((e) => {
    const { selected, ...rest } = e;
    return rest;
  });
  saveProxyServers(values);

  const sites = await getSiteProxies();
  sites.forEach(e => {
    delete e.selected;
  });
  saveSiteProxies(sites);
}
