import test from 'node:test';
import assert from 'node:assert/strict';
import {seedProject,node,clone,duplicate,find,moveNode,effective,patch,History,validateProject,safeURL,renderExport} from '../model.js';
import {executeCommand} from '../commands.js';
test('breakpoint edits inherit base properties without mutating desktop',()=>{
 const n=node('text',{x:60,text:'Desktop'});patch(n,{x:24,text:'Mobile'},'mobile');
 assert.equal(effective(n,'desktop').x,60);assert.equal(effective(n,'mobile').x,24);assert.equal(effective(n,'tablet').text,'Desktop');
 n.fontSize=44;assert.equal(effective(n,'mobile').fontSize,44);
});
test('history restores the entire document including collections and pages',()=>{
 const p=seedProject(),h=new History();h.push(p);p.pages[0].nodes[0].text='Changed';p.collections[0].items=[];
 const restored=h.undo(p);assert.equal(restored.pages[0].nodes[0].text,'folio®');assert.equal(restored.collections[0].items.length,2);
 assert.equal(h.redo(restored).pages[0].nodes[0].text,'Changed');
});
test('duplicate assigns fresh IDs to every nested node',()=>{
 const n=node('frame',{children:[node('text')]});const d=duplicate(n);assert.notEqual(n.id,d.id);assert.notEqual(n.children[0].id,d.children[0].id);assert.deepEqual(n.children[0].text,d.children[0].text);
});
test('layer movement prevents cycles and supports nesting',()=>{
 const a=node('frame',{children:[node('frame')]}),b=node('text'),nodes=[a,b];assert.equal(moveNode(nodes,a.id,a.children[0].id,true),false);assert.equal(moveNode(nodes,b.id,a.id,true),true);assert.equal(nodes.length,1);assert.equal(find(a.children,b.id).id,b.id);
});
test('project import rejects unsupported versions, duplicate IDs and invalid dimensions',()=>{
 const p=seedProject();assert.doesNotThrow(()=>validateProject(clone(p)));assert.throws(()=>validateProject({...p,schemaVersion:2}));
 const bad=clone(p);bad.pages[0].nodes[1].id=bad.pages[0].nodes[0].id;assert.throws(()=>validateProject(bad));bad.pages[0].nodes[1].id='unique';bad.pages[0].nodes[0].w=-1;assert.throws(()=>validateProject(bad));
});
test('assistant applies targeted text and layout commands to active breakpoint',()=>{
 const p=seedProject(),page=p.pages[0],n=page.nodes[0],ctx={project:p,page,selected:n,bp:'mobile',parentWidth:390};
 assert.equal(executeCommand('set selected text to "Hello world"',ctx).changed,true);assert.equal(effective(n,'mobile').text,'Hello world');assert.equal(n.text,'folio®');
 assert.equal(executeCommand('resize selected to 300 x 80',ctx).changed,true);assert.equal(effective(n,'mobile').w,300);
 assert.equal(executeCommand('set radius to 24',ctx).changed,true);assert.equal(effective(n,'mobile').radius,24);
 const before=clone(p);assert.equal(executeCommand('do something imaginary',ctx).changed,undefined);assert.deepEqual(p,before);
});
test('assistant generation preserves existing pages and adds editable layers',()=>{
 const p=seedProject(),ctx={project:p,page:p.pages[0],bp:'desktop'};const old=p.pages[0].id;
 const r=executeCommand('Create a landing page for a design studio',ctx);assert.equal(p.pages.length,2);assert.equal(p.pages[0].id,old);assert.equal(p.pages[1].id,r.pageId);assert.ok(p.pages[1].nodes.length>5);
 const count=ctx.page.nodes.length;executeCommand('Add a features section',ctx);assert.equal(ctx.page.nodes.length,count+1);assert.equal(ctx.page.nodes.at(-1).children.length,4);assert.ok(ctx.page.height>1700);
});
test('HTML export includes responsive overrides, CMS content, page links and safe text',()=>{
 const p=seedProject();p.pages[0].nodes.push(node('collection',{collectionId:p.collections[0].id}));p.pages[0].nodes[0].text='<script>alert(1)</script>';const out=renderExport(p);
 assert.ok(out.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));assert.ok(out.includes('@media(max-width:600px)'));assert.ok(out.includes('Brand identity'));assert.ok(out.includes('No message has been sent.'));assert.ok(out.includes('data-anchor="work"'));assert.ok(!out.includes('contenteditable'));
});
test('URL handling prevents executable links and external file paths',()=>{
 assert.equal(safeURL('javascript:alert(1)'), '');assert.equal(safeURL('file:///secret'), '');assert.equal(safeURL('https://example.com'),'https://example.com');assert.equal(safeURL('#page/about'),'#page/about');assert.equal(safeURL('data:text/html;base64,abc',true),'');
});
