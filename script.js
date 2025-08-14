const ID_elem = document.querySelector('#IDbox');
const getBtn = document.querySelector('#getCostumes');
const result_elem = document.querySelector('#result');

async function getSbFromId(ID){
    if (!ID) {
        window.alert('IDを入力してください');
        return;
    }
    document.title = `取得中... ID: ${ID}`;
    const project = await SBDL.downloadProjectFromID(ID);
    console.log(project);
    const arrayBuffer = project.arrayBuffer;
    const blob = new Blob([arrayBuffer], {
      type: 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    document.title = 'GetScratchCostumes';
    return url;
};

async function getCostumesFromURL(url) {
  try {
    document.title = `コスチューム取得中...`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const blobURLs = [];
    const mimeTypes = {
      '.svg': 'image/svg+xml',
      '.png': 'image/png'
    };

    const promises = [];
    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && (relativePath.endsWith('.svg') || relativePath.endsWith('.png'))) {
        const ext = relativePath.endsWith('.svg') ? '.svg' : '.png';
        promises.push(
          zipEntry.async('blob').then(blob => {
            const blobURL = URL.createObjectURL(new Blob([blob], { type: mimeTypes[ext] }));
            blobURLs.push(blobURL);
          })
        );
      }
    });

    await Promise.all(promises);
    console.log(blobURLs); // 結果を確認
    document.title = 'GetScratchCostumes';
    return blobURLs;
  } catch (error) {
    console.error('Error loading the zip file:', error);
  }
}
function showCostumes(blobURLs) {
    document.title = `コスチューム表示中...`;
    result_elem.innerHTML = ''; // 既存の内容をクリア
    blobURLs.forEach(url => {
        const result_item = document.createElement('div');
        result_item.className = 'resultItem';
        result_elem.appendChild(result_item); // ←修正
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        img.style.margin = '10px';
        result_item.appendChild(img);
        result_item.appendChild(document.createElement('br'));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '');
        link.className = 'resultItemLink';
        link.textContent = 'ダウンロード';
        result_item.appendChild(link);
    });
    document.title = 'GetScratchCostumes';
    return;
};

getBtn.addEventListener('click', async () => {
    getBtn.disabled = true; // ボタンを無効化
    const sbFile = await getSbFromId(ID_elem.value);
    console.log(sbFile);
    const cosList = await getCostumesFromURL(sbFile);
    console.log(cosList);
    showCostumes(cosList);
    getBtn.disabled = false; // ボタンを再度有効化
    return;
});