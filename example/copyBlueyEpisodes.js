// get episodes from https://en.wikipedia.org/wiki/List_of_Bluey_episodes

function copyBlueyEpisodes() {
  const episodes = {};

  document.querySelectorAll('tr:has(td:nth-of-type(6))').forEach((node) => {
    const overallEpNum = Number(node.querySelector('th').textContent);
    const s = String(Math.ceil(overallEpNum / 52)).padStart(2, '0');
    const e = String(overallEpNum % 52).padStart(2, '0');

    episodes[`S${s}E${e}`] = {
      title: node.querySelector('td:nth-of-type(2)').textContent.replaceAll('"', ''),
    };
  });
  navigator.clipboard.writeText(JSON.stringify(episodes, null, 4));
}
