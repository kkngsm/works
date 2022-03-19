"use strict";(self.webpackChunk_kkngsm_works=self.webpackChunk_kkngsm_works||[]).push([[452],{452:(e,n,o)=>{o.r(n),o.d(n,{default:()=>l});var t=o(376),r=o(477),i=o(552),s=o(485),a=o(270);class l extends class{constructor(e){this.canvas=e}resizeCanvas(e,n){const o={width:this.canvas.width,height:this.canvas.height};this.prevSize=o,this.canvas.width=e,this.canvas.height=n}fullscreen(){document.mozFullScreenElement||document.webkitCurrentFullScreenElement||document.fullscreenElement?this.canvas.cancelFullscreen?this.canvas.cancelFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitCancelFullScreen&&document.webkitCancelFullScreen():(this.resize(window.screen.width,window.screen.height),window.scrollTo(0,0),this.canvas.requestFullscreen?this.canvas.requestFullscreen():this.canvas.mozRequestFullScreen?this.canvas.mozRequestFullScreen():this.canvas.webkitRequestFullscreen&&this.canvas.webkitRequestFullscreen())}cancelFullscreen(){document.mozFullScreenElement||document.webkitCurrentFullScreenElement||document.fullscreenElement||this.resize(this.prevSize.width,this.prevSize.height)}isSmartPhone(){return!!window.navigator.userAgent.match(/iPhone|Android.+Mobile/)}mouseMove(e){this.canvas.addEventListener("mousemove",(n=>{const o=this.canvas.getBoundingClientRect(),t=n.clientX-o.left,i=n.clientY-o.top;e.value=new r.FM8(t/this.canvas.width,1-i/this.canvas.height)}),!0),this.canvas.addEventListener("touchmove",(n=>{n.preventDefault();const o=this.canvas.getBoundingClientRect();if(n.changedTouches[0]){const t=n.changedTouches[0].clientX-o.left,i=n.changedTouches[0].clientY-o.top;e.value=new r.FM8(t/this.canvas.width,1-i/this.canvas.height)}}),!0)}mouseClick(e){this.canvas.addEventListener("mousedown",(()=>{e.value=1}),!0),this.canvas.addEventListener("touchstart",(()=>{e.value=1}),!0),this.canvas.addEventListener("mouseup",(()=>{e.value=0}),!0),this.canvas.addEventListener("touchend",(()=>{e.value=0}),!0)}}{constructor(e){super(e),this.guiParams=this.addGUI(),this.camera=new r.iKG(-.5,.5,.5,-.5,-1e4,1e4),this.camera.position.z=100,this.scene=new r.xsS,this.renderer=new r.CP7({canvas:e}),this.uniforms={resolution:new r.xWb(new r.FM8),vTex:{type:"t",value:void 0},uTex:{type:"t",value:void 0},time:new r.xWb(0),strength:new r.xWb(1),color1:new r.xWb(new r.Pa4(1,1,1)),color2:new r.xWb(new r.Pa4(0,0,0)),dt:new r.xWb(this.guiParams.dt),a:new r.xWb(this.guiParams.a),b:new r.xWb(this.guiParams.b),cu:new r.xWb(this.guiParams.cu),cv:new r.xWb(this.guiParams.cv),mouse:new r.xWb(new r.FM8(.5,.5)),mousePress:new r.xWb(1)},this.mouseMove(this.uniforms.mouse),this.mouseClick(this.uniforms.mousePress),this.grayScott=new r.FIo({uniforms:this.uniforms,vertexShader:i,fragmentShader:s,glslVersion:r.LSk}),this.output=new r.FIo({uniforms:this.uniforms,vertexShader:i,fragmentShader:a,glslVersion:r.LSk});const n=new r._12(1,1);this.mesh=new r.Kj0(n,this.grayScott),this.scene.add(this.mesh),this.resize(e.clientWidth,e.clientHeight),this.uniforms.color1.value.x=this.guiParams.color1[0]/255,this.uniforms.color1.value.y=this.guiParams.color1[1]/255,this.uniforms.color1.value.z=this.guiParams.color1[2]/255,this.uniforms.color2.value.x=this.guiParams.color2[0]/255,this.uniforms.color2.value.y=this.guiParams.color2[1]/255,this.uniforms.color2.value.z=this.guiParams.color2[2]/255}static async build(e){return new l(e)}resize(e,n){this.resizeCanvas(e,n),this.renderTargets=[new r.kFz(e/4,n/4,2),new r.kFz(e/4,n/4,2)],[this.uniforms.uTex.value,this.uniforms.vTex.value]=this.renderTargets[0].texture,this.uniforms.resolution.value=new r.FM8(e,n),this.renderer.setSize(e,n)}render(e){this.uniforms.time.value=.001*e,this.mesh.material=this.grayScott;for(let e=0;e<4;e+=1)this.renderer.setRenderTarget(this.renderTargets[1]),this.renderer.clear(),this.renderer.render(this.scene,this.camera),[this.uniforms.uTex.value,this.uniforms.vTex.value]=this.renderTargets[1].texture,this.renderer.setRenderTarget(null),this.renderer.setRenderTarget(this.renderTargets[0]),this.renderer.clear(),this.renderer.render(this.scene,this.camera),[this.uniforms.uTex.value,this.uniforms.vTex.value]=this.renderTargets[0].texture;this.mesh.material=this.output,this.renderer.setRenderTarget(null),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.requestId=requestAnimationFrame((e=>this.render(e)))}addGUI(){this.gui=new t.XS;const e={dt:.9,a:.024,b:.078,cu:.002,cv:.001,color1:[147,175,81],color2:[82,95,208]};return this.gui.add(e,"dt",0,.999).onChange((e=>{this.uniforms.dt.value=e})),this.gui.add(e,"a",0,.1).onChange((e=>{this.uniforms.a.value=e})),this.gui.add(e,"b",0,.1).onChange((e=>{this.uniforms.b.value=e})),this.gui.add(e,"cu",0,.01).onChange((e=>{this.uniforms.cu.value=e})),this.gui.add(e,"cv",0,.01).onChange((e=>{this.uniforms.cv.value=e})),this.gui.addColor(e,"color1").onChange((e=>{this.uniforms.color1.value.x=e[0]/255,this.uniforms.color1.value.y=e[1]/255,this.uniforms.color1.value.z=e[2]/255})),this.gui.addColor(e,"color2").onChange((e=>{this.uniforms.color2.value.x=e[0]/255,this.uniforms.color2.value.y=e[1]/255,this.uniforms.color2.value.z=e[2]/255})),this.gui.open(),e}remove(){cancelAnimationFrame(this.requestId),this.gui.destroy()}}},552:e=>{e.exports="uniform mat4 modelViewMatrix;\r\nuniform mat4 projectionMatrix;\r\nin vec2 uv;\r\nin vec3 position;\r\nout vec2 fragCoord;\r\nvoid main(){\r\n    fragCoord = uv;\r\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}"},485:e=>{e.exports="precision highp float;\nprecision highp int;\nin vec2 fragCoord;\nlayout (location = 0) out vec4 uOut;\nlayout (location = 1) out vec4 vOut;\nuniform vec2 mouse;\nuniform float mousePress;\nuniform vec2 resolution;\nuniform sampler2D uTex;\nuniform sampler2D vTex;\n\nuniform float dt;\nuniform float a;\nuniform float b;\nuniform float cu;\nuniform float cv;\n\nuniform float time;\nfloat h2 = 0.01;\n\nvec2 norCoord(vec2 coord, vec2 resolution){\n    vec2 temp = coord * 2. - 1.;\n    return vec2(temp.x * resolution.x,temp.y * resolution.y)/min(resolution.x,resolution.y);\n}\n\nvec4 high2low(float highValue) {\n    vec4 lowValue = vec4(1., 255., 65025., 16581375.) * max(min(highValue, 0.9999), 0.);\n    lowValue = fract(lowValue);\n    lowValue -= lowValue.yzww * vec4(1./255.,1./255.,1./255.,0.);\n    return lowValue;\n}\n\nfloat low2high(sampler2D Tex, vec2 coord) {\n    vec4 lowValue = texture(Tex, coord);\n    return dot( lowValue, vec4(1., 1./255., 1./65025., 1./16581375.) );\n}\n\nvoid main() {\n    vec2 pixelSize = 1./resolution;\n    vec2 pX = vec2(pixelSize.x, 0);\n    vec2 pY = vec2(0, pixelSize.y);\n\n    float uij = low2high(uTex, fragCoord);\n    float vij = low2high(vTex, fragCoord);\n    float Du = (low2high(uTex, fragCoord + pX) +\n                low2high(uTex, fragCoord - pX) +\n                low2high(uTex, fragCoord + pY) +\n                low2high(uTex, fragCoord - pY) -\n                4.*uij)/0.01;\n    float Dv = (low2high(vTex, fragCoord + pX) +\n                low2high(vTex, fragCoord - pX) +\n                low2high(vTex, fragCoord + pY) +\n                low2high(vTex, fragCoord - pY) -\n                4.*vij)/0.01;\n\n    float f = -uij*vij*vij + a*(1.-uij);\n    float g = uij*vij*vij - b*vij;\n\n    vec2 uv = norCoord(fragCoord, resolution);\n    vec2 mouse_nor = norCoord(mouse, resolution);\n    float mcol = smoothstep(0.05, 0.0, length(uv - mouse_nor));\n\n    uOut = high2low(mix(uij + (cu * Du + f)*dt, 0.6, mousePress*mcol));\n    vOut = high2low(mix(vij + (cv * Dv + g)*dt, 0.2, mousePress*mcol));\n}"},270:e=>{e.exports="precision highp float;\nprecision highp int;\nin vec2 fragCoord;\nlayout (location = 0) out vec4 fragColor;\nuniform sampler2D uTex;\nuniform sampler2D vTex;\nuniform vec3 color1;\nuniform vec3 color2;\nfloat low2high(sampler2D _Tex, vec2 coord) {\n        vec4 lowValue = texture(_Tex, coord);\n    float fromlow = 256. / 255.;\n    return (lowValue.r * fromlow\n            + lowValue.g * fromlow / 255.\n            + lowValue.b * fromlow / 65025.\n            + lowValue.a * fromlow / 16581375.);\n}\n\nvec3 ranpUnit( vec3 col1, vec3 col2,\n    float start, float end,\n    float x){\n    return mix(col1, col2, (clamp(x, start, end)-start)/(end-start));\n}\n\nvec3 ramp(vec3 first, vec3 a, vec3 b, vec3 final,\n    float a_edge,\n    float b_edge, \n    float f){\n    vec3 col;\n    col = ranpUnit(first, a, 0., a_edge, f);\n    col = ranpUnit(col, b, a_edge, b_edge, f);\n    col = ranpUnit(col, final, b_edge, 1., f);\n    return col;\n}\n\nvoid main() {\n    float f = low2high(vTex, fragCoord);\n    fragColor.xyz = ramp(\n        vec3(0), color1, color2, vec3(1),\n                0.125,              0.25,\n        f);\n    fragColor.w = 1.;\n}"}}]);