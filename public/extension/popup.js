document.getElementById('openApp').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://your-app-url.lovable.app/app' });
});

document.getElementById('runFill').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'runFill' });
  window.close();
});
