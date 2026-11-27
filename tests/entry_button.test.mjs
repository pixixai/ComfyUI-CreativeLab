import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../web/main.js',import.meta.url),'utf8').replace(/^import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?[^\n]*$/gm,'');

for(const publicAPI of [true,false])for(const settings of [true,false]){
    test(`entry button opens the panel with ${publicAPI?'the public button group':'a plain wrapper'} in ${settings?'the settings group':'the legacy menu'}`,async()=>{
        const element=tag=>({tag,style:{},children:[],appendChild(child){this.children.push(child);}});
        const menu=element('menu'),groups=[];let extension,opens=0,constructs=0,imports=0;
        class ComfyButtonGroup {
            constructor(button){constructs++;this.element=element('native-group');this.element.appendChild(button);}
        }
        const context=vm.createContext({
            app:{graph:{serialize(){},clear(){}},...(settings?{menu:{settingsGroup:{element:{before:group=>groups.push(group)}}}}:{}),registerExtension(value){extension=value;}},
            window:{...(publicAPI?{comfyAPI:{buttonGroup:{ComfyButtonGroup}}}:{}),addEventListener(){}},
            document:{createElement:element,querySelector:selector=>selector==='.comfy-menu'?menu:null},
            console:{log(){}},setupUI(){},setupEditHistory(){},setupAPIInjector(){},togglePanel(){opens++;},StateManager:{},
        });
        const script=new vm.Script(source,{importModuleDynamically(){imports++;throw new Error('Legacy imports must not be requested');}});
        script.runInContext(context);await extension.setup();
        assert.equal(imports,0);assert.equal(constructs,publicAPI?1:0);
        const mounted=settings?groups:menu.children;
        assert.equal(mounted.length,1);assert.equal(mounted[0].tag,publicAPI?'native-group':'div');assert.equal(mounted[0].style.margin,'0');
        assert.equal(settings?menu.children.length:groups.length,0);
        const button=mounted[0].children[0];assert.equal(button.className,'comfyui-button');assert.match(button.innerHTML,/>CLab</);
        assert.match(button.title,/快捷键C/);button.onclick();assert.equal(opens,1);
        context.window._clabShortcutRaw='v';button.onmouseover();assert.match(button.title,/快捷键V/);
    });
}
