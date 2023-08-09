
const DownloadManager = {
  async clearHistory() {
    chrome.downloads.erase({
      state: 'complete'
    }, () => {
      console.log('Clear download history completed');
    });
  },
};

const HistoryManager = {
  async clear() {
    chrome.history.deleteAll(() => {
      console.log('Clear history completed');
    });
  },
};
