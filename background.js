
chrome.runtime.onInstalled.addListener(() => {
  console.log('Plugin has been installed');

  // chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
  //   // chrome.declarativeContent.onPageChanged.addRules([{
  //   //   conditions: [
  //   //     new chrome.declarativeContent.PageStateMatcher({
  //   //       pageUrl: { hostEquals: 'developer.chrome.com' }
  //   //     })
  //   //   ],
  //   //   actions: [
  //   //     new chrome.declarativeContent.ShowPageAction()
  //   //   ]
  //   // }]);

  //   chrome.tabs.onActivated.addListener(async (activeInfo) => {
  //     // console.log(activeInfo.tabId);
  //     const current = await getCurrentTab()
  //     console.log(current.url);
  //   });
  // });

  // chrome.browserAction.onClicked.addListener((tab) => {

  // });
});


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
