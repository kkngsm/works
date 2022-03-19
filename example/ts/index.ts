import "../sass/style.sass";
import Work from "@work" /*replace webpack arias*/;
window.onload = async () => {
  const canvas = document.createElement(`canvas`);
  (document.getElementById(`wrapper`) as HTMLElement).appendChild(canvas);
  Work.build(canvas).then((work) => {
    work.render(0);
    (document.getElementById(`fullscreen`) as HTMLInputElement).onclick =
      () => {
        work.fullscreen();
      };
    [``, `webkit`, `moz`, `ms`].forEach((prefix) =>
      document.addEventListener(`${prefix}fullscreenchange`, () => {
        work.cancelFullscreen();
      })
    );
  });
};
