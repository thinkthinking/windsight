import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import test from 'node:test';

test('ZenMux per-brand imports match actual published directory casing on Linux',async()=>{
 const source=await readFile(new URL('../app/components/brand-logo.tsx',import.meta.url),'utf8');
 const directories=await readdir(new URL('../node_modules/@zenmux/icons/dist/',import.meta.url));
 const imports=[...source.matchAll(/from\s+["']@zenmux\/icons\/([^"']+)["']/g)].map(match=>match[1]);
 assert.ok(imports.length>0);
 for(const name of imports)assert.ok(directories.includes(name),`${name} must exactly match its published per-brand export directory`);
});
