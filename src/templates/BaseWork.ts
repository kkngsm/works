/* eslint-disable no-param-reassign */
import { Uniform, Vector2 } from "three";

declare global {
  interface Document {
    webkitCurrentFullScreenElement(): void;
    fullscreenElement?: () => void;
    webkitCancelFullScreen(): void;
    mozCancelFullScreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    webkitFullscreenElement?: Element;
  }

  interface HTMLElement {
    requestFullscreen(): void;
    cancelFullscreen(): void;
    mozRequestFullScreen(): void;
    mozCancelFullScreen(): void;
    webkitRequestFullscreen(): void;
    webkitCancelFullScreen(): void;
  }
}

type size = { width: number; height: number };
export default abstract class BaseWork {
  private prevSize: size;

  protected canvas: HTMLCanvasElement;

  protected requestId: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  abstract render(time: number): void;

  abstract remove(): void;

  abstract resize(width: number, height: number): void;

  protected resizeCanvas(width: number, height: number) {
    const s = {
      width: this.canvas.width,
      height: this.canvas.height,
    };
    this.prevSize = s;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  fullscreen() {
    if (
      document.mozFullScreenElement ||
      document.webkitCurrentFullScreenElement ||
      document.fullscreenElement
    ) {
      // end fullscreen
      if (this.canvas.cancelFullscreen) {
        this.canvas.cancelFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    } else {
      this.resize(window.screen.width, window.screen.height);
      window.scrollTo(0, 0);
      if (this.canvas.requestFullscreen) {
        this.canvas.requestFullscreen();
      } else if (this.canvas.mozRequestFullScreen) {
        this.canvas.mozRequestFullScreen();
      } else if (this.canvas.webkitRequestFullscreen) {
        this.canvas.webkitRequestFullscreen();
      }
    }
  }

  cancelFullscreen() {
    if (
      !(
        document.mozFullScreenElement ||
        document.webkitCurrentFullScreenElement ||
        document.fullscreenElement
      )
    ) {
      this.resize(this.prevSize.width, this.prevSize.height);
    }
  }

  protected isSmartPhone(): boolean {
    return !!window.navigator.userAgent.match(/iPhone|Android.+Mobile/);
  }

  protected mouseMove(uMouse: Uniform) {
    this.canvas.addEventListener(
      `mousemove`,
      (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        uMouse.value = new Vector2(
          x / this.canvas.width,
          1 - y / this.canvas.height
        );
      },
      true
    );
    this.canvas.addEventListener(
      `touchmove`,
      (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        if(e.changedTouches[0]){
          const x = e.changedTouches[0].clientX - rect.left;
          const y = e.changedTouches[0].clientY - rect.top;
          uMouse.value = new Vector2(
            x / this.canvas.width,
            1 - y / this.canvas.height
          );
        }
      },
      true
    );
  }

  protected mouseClick(uMouseClick: Uniform) {
    this.canvas.addEventListener(
      `mousedown`,
      () => {
        uMouseClick.value = 1;
      },
      true
    );
    this.canvas.addEventListener(
      `touchstart`,
      () => {
        uMouseClick.value = 1;
      },
      true
    );
    this.canvas.addEventListener(
      `mouseup`,
      () => {
        uMouseClick.value = 0;
      },
      true
    );
    this.canvas.addEventListener(
      `touchend`,
      () => {
        uMouseClick.value = 0;
      },
      true
    );
  }
}
