// Яндекс Игры: файл и SDK (/sdk.js) добавляет только сборка tools/build-platforms.py.
// Каталог запрещает ссылки на сторонние площадки, поэтому приглашения, установка и кнопки соцсетей скрыты.
window.VDP_PLATFORM = {
  name: 'yandex',
  sdk: null,
  // «Игровой процесс» для статистики Яндекса: идёт, пока открыт экран недели
  view(v) { const g = this.sdk?.features?.GameplayAPI; if (g) v === 'game' ? g.start() : g.stop(); },
};
document.head.insertAdjacentHTML('beforeend', '<style>#openInvite, #installApp, #viralPop, #remindDaily, .viral, .share-grid a[target="_blank"] { display: none !important; }</style>');
if (window.YaGames) YaGames.init().then(sdk => { VDP_PLATFORM.sdk = sdk; sdk.features?.LoadingAPI?.ready(); }).catch(() => {});
