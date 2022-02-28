import "../sass/style.sass";
import Work from /*replace*/ "../../src/test" /*replace*/;
window.onload = async () => {
  const canvas = document.createElement(`canvas`);
  (document.getElementById(`wrapper`) as HTMLElement).appendChild(canvas);
  const work = await Work.build(canvas);
  work.render(0);
  (document.getElementById(`fullscreen`) as HTMLInputElement).onclick = () => {
    work.fullscreen();
  };
  [``, `webkit`, `moz`, `ms`].forEach((prefix) =>
    document.addEventListener(`${prefix}fullscreenchange`, () => {
      work.cancelFullscreen();
    })
  );
};
