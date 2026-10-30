'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const {newGame,movePlayer,publicRoom,cleanName}=require('../game');
function fixture(){const room={code:'ABC123',hostId:'p1',started:true,players:[{id:'p1',name:'Alpha',pos:0,score:0,charges:2,connected:true},{id:'p2',name:'Beta',pos:6,score:0,charges:2,connected:true}]};newGame(room);room.started=true;return room;}
test('names are normalized and bounded',()=>{assert.equal(cleanName('<b>Rohith</b>'),'bRohith/b');assert.equal(cleanName('x'.repeat(30)).length,18);});
test('server rejects action from wrong turn',()=>{const r=fixture();assert.throws(()=>movePlayer(r,r.players[1],{type:'scan'}),/not your turn/)});
test('scan gives one point and advances turn',()=>{const r=fixture();movePlayer(r,r.players[0],{type:'scan'});assert.equal(r.players[0].score,1);assert.equal(r.state.turn,1)});
test('steal transfers only existing points',()=>{const r=fixture();r.players[0].pos=0;r.players[1].pos=1;r.players[1].score=1;movePlayer(r,r.players[0],{type:'steal'});assert.equal(r.players[0].score,1);assert.equal(r.players[1].score,0)});
test('rejects movement outside board',()=>{const r=fixture();assert.throws(()=>movePlayer(r,r.players[0],{type:'move',direction:'left'}),/boundary/)});
test('cores are consumed and score two',()=>{const r=fixture();r.players[0].pos=7;movePlayer(r,r.players[0],{type:'move',direction:'right'});assert.equal(r.players[0].score,2);assert.equal(r.state.tiles[8],'')});
test('win state is authoritative',()=>{const r=fixture();r.players[0].score=11;r.players[0].pos=7;movePlayer(r,r.players[0],{type:'move',direction:'right'});assert.equal(r.state.over,true);assert.equal(r.state.winner,'p1')});
test('public room does not expose session tokens',()=>{const r=fixture();r.players[0].token='secret';const pub=publicRoom(r);assert.equal(pub.players[0].token,undefined)});
