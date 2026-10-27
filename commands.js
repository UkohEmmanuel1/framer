import {node,newPage,seedProject,find,effective,patch,WIDTHS,uid} from './model.js';
export const COMMAND_GUIDE=`Local assistant commands
• Create a landing page for [your business]
• Add a features / hero / pricing / contact / footer section
• Add text "Your words", a button, frame, image, or ellipse
• Set selected text to "Your words"
• Set color / background / font size / radius / opacity to [value]
• Make the background #111827
• Move selected to 100, 200
• Resize selected to 400 x 200
• Rename selected to [name]
• Hide / show / lock / unlock / delete / duplicate selected
• Center selected
• Create page [name]
• Use dark / light theme
• Undo / redo

Select a layer for targeted edits. Layout changes affect the active breakpoint. This assistant runs entirely in your browser and understands these explicit commands; it does not use a language model.`;
const colorNames={purple:'#8b5cf6',blue:'#3b82f6',green:'#10b981',red:'#ef4444',pink:'#ec4899',orange:'#f97316',black:'#111111',white:'#ffffff',cream:'#f6f3ef',gray:'#6b7280',grey:'#6b7280'};
function colorValue(s){const hex=s.match(/#[a-f0-9]{6}\b|#[a-f0-9]{3}\b/i);if(hex)return hex[0];return Object.entries(colorNames).find(([k])=>new RegExp('\\b'+k+'\\b','i').test(s))?.[1];}
export function sectionNodes(type,y,width=1200){
 const mobile=width<=600,pad=mobile?24:64,w=width-pad*2;
 const frame=node('frame',{name:type[0].toUpperCase()+type.slice(1)+' section',x:pad,y,w,h:type==='hero'?420:type==='footer'?140:360,fill:type==='pricing'?'#ede6f7':'#ffffff',radius:14,anchor:type,overrides:{tablet:{x:40,w:730},mobile:{x:24,w:342,h:type==='features'?650:type==='pricing'?700:type==='footer'?140:400}}});
 const child=(t,p)=>node(t,p);
 frame.children=[child('text',{name:'Section title',x:32,y:32,w:w-64,h:70,text:{features:'Made for what’s next.',hero:'Make something\nextraordinary.',pricing:'Simple plans. Big ideas.',contact:'Let’s build something.',footer:'Your next chapter starts here.'}[type]||'A new section',fontSize:type==='hero'?56:type==='footer'?24:36,fontWeight:600,letterSpacing:-1.2,overrides:{mobile:{x:22,w:298,fontSize:type==='hero'?40:28,h:80}}})];
 if(type==='features'||type==='pricing')for(let i=0;i<3;i++)frame.children.push(child('frame',{name:(type==='pricing'?'Plan ':'Feature ')+(i+1),x:32+i*(w-64)/3,y:130,w:(w-100)/3,h:185,fill:type==='pricing'?'#ffffff':'#f4effa',radius:10,overrides:{tablet:{x:25+i*225,w:210},mobile:{x:22,y:130+i*180,w:298,h:155}},children:[child('text',{name:'Card title',x:20,y:22,w:220,h:30,text:type==='pricing'?['Starter · $0','Studio · $19','Scale · $49'][i]:['Thoughtful by default','Room to experiment','Built to grow'][i],fontSize:18,fontWeight:600,overrides:{tablet:{w:170},mobile:{w:258}}}),child('text',{name:'Card copy',x:20,y:67,w:220,h:90,text:type==='pricing'?'Everything you need to bring your next idea to life.':'A considered experience, from the first idea to the smallest detail.',fontSize:14,color:'#82738e',lineHeight:1.6,overrides:{tablet:{w:170},mobile:{w:258,h:65}}})]}));
 if(type==='hero')frame.children.push(child('text',{x:32,y:190,w:Math.min(w-64,580),h:65,text:'An independent approach to meaningful digital experiences.',fontSize:18,color:'#82738e',lineHeight:1.6,overrides:{mobile:{x:22,y:170,w:298,h:90,fontSize:16}}}),child('button',{x:32,y:295,text:'Get started ↗',overrides:{mobile:{x:22,y:290}}}));
 if(type==='contact')frame.children.push(child('form',{x:32,y:130,w:Math.min(w-64,500),h:210,overrides:{mobile:{x:22,w:298}}}));
 if(type==='footer')frame.children.push(child('text',{x:32,y:90,w:w-64,h:24,text:'© '+new Date().getFullYear()+' · Crafted with care.',fontSize:12,color:'#82738e',overrides:{mobile:{x:22,w:298}}}));
 return frame;
}
export function executeCommand(input,ctx){
 const raw=input.trim(),s=raw.toLowerCase(),p=ctx.project,page=ctx.page,n=ctx.selected,bp=ctx.bp||'desktop';
 if(!s)return {message:'Enter an editing command.'};
 if(/^(help|commands|what can you do)\??$/.test(s))return{message:COMMAND_GUIDE};
 if(/^(undo|redo)$/.test(s))return{action:s,message:s==='undo'?'Reverted the last change.':'Restored the last change.'};
 if(/^(create|build|generate|make) (a |an )?(landing page|website|site)\b/.test(s)){
   const business=raw.replace(/^(create|build|generate|make) (a |an )?(landing page|website|site)( for)?\s*/i,'').trim()||'Your studio';
   const seed=seedProject().pages[0];seed.id=uid();seed.name=business.slice(0,32);seed.slug='landing-'+p.pages.length;const headline=seed.nodes.find(a=>a.name==='Hero headline');headline.text=business.toLowerCase().includes('design')?'Ideas into\nextraordinary.':business.replace(/^(a|an) /i,'')+'\nReimagined.';p.pages.push(seed);return{changed:true,pageId:seed.id,message:`Created a new editable landing page for ${business}. Your existing pages are preserved.`};
 }
 const sec=s.match(/\b(hero|features|pricing|contact|footer)\s+section\b/);
 if(sec){let bottom=0;for(const a of page.nodes){const v=effective(a,bp);bottom=Math.max(bottom,v.y+v.h);}const a=sectionNodes(sec[1],bottom+64,WIDTHS[bp]);page.nodes.push(a);page.height=Math.max(page.height,bottom+64+a.h+64);return{changed:true,selectedId:a.id,message:`Added an editable ${sec[1]} section below your content.`};}
 const pg=raw.match(/^(?:create|add|new) (?:a )?page\s+(.+)$/i);if(pg){const a=newPage(pg[1].replace(/^['"]|['"]$/g,''));p.pages.push(a);return{changed:true,pageId:a.id,message:`Created the ${a.name} page.`};}
 if(/\b(dark|light) theme\b/.test(s)){const dark=s.includes('dark');page.background=dark?'#15121c':'#f6f3ef';const visit=nodes=>nodes.forEach(a=>{if(a.type==='text')patch(a,{color:dark?'#eee7fa':'#2b2534'},bp);if(a.type==='frame')patch(a,{fill:dark?'#282031':'#eae2f3'},bp);visit(a.children);});visit(page.nodes);return{changed:true,message:`Applied the ${dark?'dark':'light'} theme to this page.`};}
 const add=raw.match(/^(?:add|insert|create) (?:a |an )?(text|button|frame|image|ellipse|circle|line|form)\b(.*)$/i);
 if(add){const type=add[1].toLowerCase()==='circle'?'ellipse':add[1].toLowerCase();const text=add[2].trim().replace(/^(?:that says|with text)\s*/i,'').replace(/^["“']|["”']$/g,'');const a=node(type,{x:40,y:100,...(text&&['text','button'].includes(type)?{text}:{}),...(bp==='mobile'?{w:300}:{})});page.nodes.push(a);return{changed:true,selectedId:a.id,message:`Added a ${type}${text?' with your text':''}.`};}
 const col=colorValue(raw);
 if(/\b(background|fill)\b/.test(s)&&col){if(n&&!s.includes('page background')&&!s.startsWith('make the background'))patch(n,{fill:col},bp);else page.background=col;return{changed:true,message:`Set ${n&&!s.startsWith('make the background')?'the selected fill':'the page background'} to ${col}.`};}
 if(!n)return{message:'Select a layer first for this edit. Try “Add text”, “Add a features section”, “Create page About”, or “help”.'};
 const value=effective(n,bp);
 if(/^(delete|remove)( selected)?$/.test(s))return{action:'delete',message:'Deleted the selected layer.'};
 if(/^duplicate( selected)?$/.test(s))return{action:'duplicate',message:'Duplicated the selected layer.'};
 if(/^(hide|show|lock|unlock)( selected)?$/.test(s)){const key=s.startsWith('hide')||s.startsWith('show')?'visible':'locked',v=s.startsWith('show')||s.startsWith('lock');if(key==='locked')n.locked=v;else patch(n,{visible:v},bp);return{changed:true,message:`${raw.split(' ')[0]} applied to ${n.name}.`};}
 const text=raw.match(/^(?:set |change |replace )?(?:selected )?text(?: to| with|:)\s*(.+)$/is);if(text){if(!['text','button'].includes(n.type))return{message:'Select a text or button layer to change its text.'};patch(n,{text:text[1].replace(/^["“']|["”']$/g,'')},bp);return{changed:true,message:'Updated the selected text.'};}
 const rename=raw.match(/^rename(?: selected)?(?: to)?\s+(.+)$/i);if(rename){n.name=rename[1];return{changed:true,message:'Renamed the selected layer.'};}
 const xy=s.match(/^(move|resize)(?: selected)?(?: to)?\s+(-?\d+)\s*[,x× ]\s*(-?\d+)$/);if(xy){const a=Number(xy[2]),b=Number(xy[3]);if(xy[1]==='resize'&&(a<1||b<1))return{message:'Width and height must be greater than zero.'};patch(n,xy[1]==='move'?{x:a,y:b}:{w:a,h:b},bp);return{changed:true,message:`${xy[1]==='move'?'Moved':'Resized'} ${n.name}.`};}
 const number=s.match(/(?:font size|radius|opacity|rotation)(?: to|:)?\s+(\d+(?:\.\d+)?)/);if(number){const key=s.includes('font size')?'fontSize':s.includes('radius')?'radius':s.includes('opacity')?'opacity':'rotation';let v=Number(number[1]);if(key==='opacity')v=Math.min(1,v>1?v/100:v);patch(n,{[key]:v},bp);return{changed:true,message:`Updated ${key} to ${v}.`};}
 if(/\b(color|colour)\b/.test(s)&&col){patch(n,{color:col},bp);return{changed:true,message:`Changed text color to ${col}.`};}
 if(/center selected|center (it|this)|^center$/.test(s)){patch(n,{x:Math.round((ctx.parentWidth-value.w)/2)},bp);return{changed:true,message:'Centered the layer horizontally in its parent.'};}
 return{message:'I couldn’t match that command. No changes were made. Open the command guide for supported edits, or try “set selected text to Hello”, “resize selected to 400 x 200”, or “set radius to 24”.'};
}
