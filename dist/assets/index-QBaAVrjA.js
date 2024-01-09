(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&c(i)}).observe(document,{childList:!0,subtree:!0});function d(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function c(e){if(e.ep)return;e.ep=!0;const n=d(e);fetch(e.href,n)}})();const p=750;let a=document.getElementById("canvas"),u=a.getContext("2d"),l=[],h=0,f={x:0,y:0,width:0,height:0},w=!1;document.getElementById("imageInput").addEventListener("change",v,!1);document.getElementById("prevButton").addEventListener("click",()=>I(-1),!1);document.getElementById("nextButton").addEventListener("click",()=>I(1),!1);document.getElementById("cropButton").addEventListener("click",A,!1);document.getElementById("downloadButton").addEventListener("click",D,!1);a.addEventListener("mousedown",L,!1);a.addEventListener("mousemove",x,!1);a.addEventListener("mouseup",C,!1);function v(t){const o=t.target.files;l=[];const d=Array.from(o).sort((e,n)=>e.name<n.name?-1:1);console.log(d);function c(e){if(e>=d.length)return;const n=d[e],i=new FileReader;i.onload=function(r){let s=new Image;s.onload=()=>{l.push(s),l.length===1&&E(0),c(e+1)},s.src=r.target.result},i.readAsDataURL(n)}c(0)}function E(t){if(t>=0&&t<l.length){h=t;let o=l[t];const d=p/o.width;a.width=p,a.height=o.height*d,u.drawImage(o,0,0,a.width,a.height),y()}}function I(t){const o=h+t;o>=0&&o<l.length&&E(o)}let m=[];function L(t){f={x:0,y:t.offsetY,width:a.width,height:0},w=!0}function x(t){w&&(f.height=t.offsetY-f.y,y())}function C(){w&&f.height>0&&(m.push({...f}),y()),w=!1}function y(){u.clearRect(0,0,a.width,a.height),u.drawImage(l[h],0,0,a.width,a.height),u.strokeStyle="red",m.forEach(t=>{u.strokeRect(t.x,t.y,t.width,t.height)}),b()}function b(){const t=document.getElementById("selectedAreasList");t.innerHTML="",m.forEach((o,d)=>{const c=document.createElement("div");c.innerText=`Area ${d+1}: (${o.x}, ${o.y}) - ${o.width}x${o.height}`;const e=document.createElement("button");e.classList.add("btn"),e.classList.add("btn-danger"),e.innerText="Delete",e.addEventListener("click",()=>B(d)),c.appendChild(e),t.appendChild(c)})}function B(t){m.splice(t,1),y()}function A(){const t=document.createElement("canvas");let o=0,d=0;m.forEach(n=>{const i=p/l[h].width,r={x:n.x/i,y:n.y/i,width:n.width/i,height:n.height/i};o+=r.height,d=Math.max(d,r.width)}),t.width=d,t.height=o;const c=t.getContext("2d");let e=0;m.forEach(n=>{const i=p/l[h].width,r={x:n.x/i,y:n.y/i,width:n.width/i,height:n.height/i};c.drawImage(l[h],r.x,r.y,r.width,r.height,0,e,r.width,r.height),document.getElementById("croppedImages").appendChild(t),e+=r.height})}function D(){const t=document.getElementById("croppedImages").getElementsByTagName("canvas");if(t.length===0){console.error("No cropped images to combine.");return}let d=0,c=0;Array.from(t).forEach(g=>{d+=g.height,c=Math.max(c,g.width)});const e=document.createElement("canvas");e.width=c,e.height=d;const n=e.getContext("2d");let i=0;Array.from(t).forEach(g=>{n.drawImage(g,0,i),i+=g.height});const r=e.toDataURL("image/jpeg"),s=document.createElement("a");s.href=r,s.download="combined_image.jpg",s.innerText="Download Combined Image",document.body.appendChild(s),s.click(),document.body.removeChild(s)}
