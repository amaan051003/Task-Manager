import { useEffect, useRef } from "react";

export default function NotFound() {
  const flowRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("page--in");

    // The original page uses OGL WebGL animation
    // This assumes ogl is loaded in your project
    // npm install ogl

    import("ogl").then((ogl) => {
      const containers = flowRef.current;

      if (!containers) return;

      const renderer = new ogl.Renderer({
        dpr: 2,
        alpha: true,
        antialias: true,
      });

      const gl = renderer.gl;
      containers.appendChild(gl.canvas);

      renderer.setSize(
        containers.offsetWidth,
        containers.offsetHeight
      );

      function animate() {
        requestAnimationFrame(animate);
        renderer.render({ scene: null });
      }

      animate();
    });
  }, []);

  return (
    <div className="not__found page--in">
      
      <header className="not__found__header">
        <div className="ybn__logo">
          <a href="/">
            <svg className="ybn" viewBox="0 0 424 240">
              <path d="M40.2,239.6v-63.3L0.2,0h52.4l34.8,176.3v63.3H40.2z M92.7,160.2l-24-120.9L76.6,0H129L92.7,160.2z"></path>
              <path d="M135,239.6V0h47.2v239.6H135z"></path>
              <path d="M376.8,239.6v-46.4H424v46.4H376.8z"></path>
            </svg>
          </a>
        </div>

        <div className="not__found__btn flak">
          <span className="header__btn__inner">
            <a href="/">Home</a>
          </span>
        </div>
      </header>

      <div className="section__main not__found__main">
        <div className="flowmap">
          <div className="flowmap--inner" ref={flowRef}></div>
        </div>
      </div>

    </div>
  );
}