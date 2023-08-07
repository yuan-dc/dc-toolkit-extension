
const Notification = {

  notify: async function(options) {
    const { id: notificationId, ...rest } = options;
    return new Promise((resolve, reject) => {
      chrome.notifications.create(
        notificationId,
        { ...rest },
        () => {
          resolve();
        }
      )
    });
  },

};