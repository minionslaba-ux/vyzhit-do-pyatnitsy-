// Покадровый рендер заставки: кадры PNG → ffmpeg → MP4.
// Запуск: python3 tools/trailer/sound.py tools/trailer/sound.wav && node tools/trailer/render.js tall promo/video/zastavka-9x16.mp4 (или wide … zastavka-16x9.mp4)
const {chromium}=require('playwright');const {execFileSync}=require('child_process');const fs=require('fs');
const [,, mode, out]=process.argv; const T=__dirname;
const W=mode==='wide'?1920:1080, H=mode==='wide'?1080:1920, FPS=30, DUR=15;
(async()=>{const b=await chromium.launch();const vw=mode==='wide'?{width:960,height:540}:{width:540,height:960};
const pg=await b.newPage({viewport:vw,deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+T+'/trailer.html');
if(mode==='wide') await pg.addStyleTag({content:'#stage{top:0;transform:scale(.5625);transform-origin:50% 0}'});
await pg.evaluate(()=>window.ready);await pg.waitForTimeout(800);
const dir=require('os').tmpdir()+'/vdp-frames-'+mode;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
for(let i=0;i<FPS*DUR;i++){await pg.evaluate(t=>frame(t),i/FPS);await pg.screenshot({path:`${dir}/f${String(i).padStart(4,'0')}.png`});}
await b.close();if(errs.length)console.log('errors',errs);
execFileSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',dir+'/f%04d.png','-i',T+'/sound.wav','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-vf',`scale=${W}:${H}`,'-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',out]);
console.log('ok',out,(fs.statSync(out).size/1024|0)+' KB');})();
