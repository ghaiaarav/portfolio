import { PACK_IDS } from "@/lib/packs";

/**
 * Runs in <head> before first paint: copies saved theme, resource pack and
 * accessibility settings onto <html> so CSS can style the very first frame
 * (no flash of the default sky or GUI scale). McGuiProvider keeps them in
 * sync after hydration. Keys must match McGuiProvider's localStorage keys.
 *
 * It also sets --mc-fp / --mc-fp-sm: the CSS size of one Minecraftia font
 * pixel, rounded so it covers a whole number of device pixels. The font is
 * drawn on an 8-unit grid, so text is only crisp at 8 × that size; this keeps
 * it crisp at 1x, 1.25x, 1.5x, 2x, 3x and after browser zoom.
 *
 * data-launch marks the first page load of a visit, so the title screen can
 * fade in the way Minecraft's does on launch (and not on every return).
 */
export const PRE_PAINT_SCRIPT = `(function(){try{
var d=document.documentElement,s=window.localStorage,packs=${JSON.stringify(PACK_IDS)};
d.dataset.theme=s.getItem("mc-theme")==="dark"?"dark":"light";
var p=s.getItem("mc-resource-pack");d.dataset.pack=packs.indexOf(p)>=0?p:"vanilla";
var a=JSON.parse(s.getItem("mc-accessibility")||"{}");
if(["small","normal","large"].indexOf(a.guiScale)>=0)d.dataset.guiScale=a.guiScale;
d.dataset.highContrast=String(!!a.highContrast);d.dataset.reducedMotion=String(!!a.reducedMotion);
}catch(e){}
try{
var r=document.documentElement;
var px=function(){
var dpr=window.devicePixelRatio||1;
r.style.setProperty("--mc-fp",Math.max(1,Math.round(2*dpr))/dpr+"px");
r.style.setProperty("--mc-fp-sm",Math.max(1,Math.ceil(1.5*dpr))/dpr+"px");
window.matchMedia("(resolution: "+dpr+"dppx)").addEventListener("change",px,{once:true});
};px();
}catch(e){}
try{
if(!window.sessionStorage.getItem("mc-launched")){
window.sessionStorage.setItem("mc-launched","1");
document.documentElement.dataset.launch="true";
setTimeout(function(){delete document.documentElement.dataset.launch;},2500);
}
}catch(e){}})();`;
