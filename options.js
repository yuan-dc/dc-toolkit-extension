
window.onload = () => {
  document.getElementById('btn_save').addEventListener('click', save);
  document.getElementById('btn_fmt').addEventListener('click', format);
  document.getElementById('btn_default').addEventListener('click', setDefault);

  getSettings().then((data) => {
    document.getElementById('content').value = JSON.stringify(data, {}, 2);
  });

  getProxySettings().then(data => {
    let content = JSON.stringify(data, {}, 2);
    content = content.replace(/\n/g, '<br/>').replace(/\\n/g, '<br/>');
    console.log(content)
    document.querySelector('.options-value').innerHTML = content;
  })
};

function save() {
  const content = document.getElementById('content').value;

  let error = '';
  if (!content) {
    error = 'Content cannot be empty';
  }
  let val = {};
  try {
    val = JSON.parse(content);
    // if (!Array.isArray(val)) {
    //   error = 'Content is invalid';
    // }
  } catch (e) {
    console.error(e);
    error = 'Content is invalid';
  }
  // console.log(content);
  if (error) {
    document.querySelector('.error-message').innerHTML = error;
    return;
  }

  // console.log(val);
  saveSettings(val);
  document.querySelector('.message').innerHTML = '配置已保存';
}

function format() {
  let content = document.getElementById('content').value;
  try {
    const val = JSON.parse(content);
    content = JSON.stringify(val, {}, 2);
    document.getElementById('content').value = content;
  } catch (e) {
    console.warn(e);
  }
}

function setDefault() {
  const content = `{
    "servers": [
      {
        "name": "WJ-2.38",
        "proxy": "socks5://192.168.2.38:9666",
        "selected": true
      }
    ]
  }`;
  document.getElementById('content').value = content;
  format();
}
