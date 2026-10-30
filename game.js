'use strict';
const W=7, TARGET=12, MAX_PLAYERS=4;
const starts=[0,6,42,48];
const cleanName=(v)=>String(v||'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,18)||'Player';
function newGame(room){
 const tiles=Array(49).fill('');[8,12,17,23,25,31,35,40].forEach(i=>tiles[i]='core');[10,38].forEach(i=>tiles[i]='trap');[20,28].forEach(i=>tiles[i]='portal');[3,45].forEach(i=>tiles[i]='boost');
 room.players.forEach((p,i)=>{p.pos=starts[i];p.score=0;p.charges=2;p.ready=false;p.connected=!!p.socketId;});
 room.state={tiles,turn:0,round:1,over:false,winner:null,feed:['Match initialized. The grid is live.']};
}
function publicRoom(room){return {code:room.code,hostId:room.hostId,started:room.started,players:room.players.map(p=>({id:p.id,name:p.name,score:p.score,pos:p.pos,charges:p.charges,ready:p.ready,connected:p.connected})),state:room.state?JSON.parse(JSON.stringify(room.state)):null};}
function dist(a,b){return Math.abs(a%W-b%W)+Math.abs(Math.floor(a/W)-Math.floor(b/W));}
function addFeed(s,msg){s.feed.unshift(msg);s.feed=s.feed.slice(0,12);}
function checkItemSpawns(room){
 const s=room.state;if(!s||s.over)return;
 const count=s.tiles.filter(t=>t==='core'||t==='boost').length;
 if(count<2){
  const empties=[];
  for(let i=0;i<49;i++){
   if(!s.tiles[i]&&!room.players.some(p=>p.pos===i))empties.push(i);
  }
  empties.sort(()=>Math.random()-0.5);
  empties.slice(0,2).forEach(idx=>s.tiles[idx]='core');
  if(empties.length)addFeed(s,'⚡ New signal cores detected on the grid!');
 }
}
function movePlayer(room,p,action){
 const s=room.state;if(!room.started||!s||s.over)throw Error('Match is not active');
 const active=room.players[s.turn];if(!active||active.id!==p.id)throw Error('It is not your turn');
 if(!action||typeof action.type!=='string')throw Error('Invalid action');
 if(action.type==='move'){
  const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};const d=dirs[action.direction];if(!d)throw Error('Invalid direction');
  const x=p.pos%W,y=Math.floor(p.pos/W),nx=x+d[0],ny=y+d[1];if(nx<0||nx>=W||ny<0||ny>=W)throw Error('Grid boundary reached');const to=ny*W+nx;if(room.players.some(q=>q.id!==p.id&&q.pos===to))throw Error('Tile occupied');p.pos=to;resolveTile(room,p);addFeed(s,`${p.name} moved ${action.direction}.`);
 }else if(action.type==='dash'){
  if(p.charges<1)throw Error('No overdrive charges left');const x=p.pos%W,y=Math.floor(p.pos/W);const opts=[[0,-1,'up'],[0,1,'down'],[-1,0,'left'],[1,0,'right']].map(([dx,dy,direction])=>({x:x+2*dx,y:y+2*dy,mx:x+dx,my:y+dy,direction})).filter(o=>o.x>=0&&o.x<W&&o.y>=0&&o.y<W&&!room.players.some(q=>q.id!==p.id&&(q.pos===o.my*W+o.mx||q.pos===o.y*W+o.x)));
  if(!opts.length)throw Error('No clear two-tile dash available');opts.sort((a,b)=>tileValue(s.tiles[b.y*W+b.x])-tileValue(s.tiles[a.y*W+a.x]));const o=opts[0];p.charges--;p.pos=o.y*W+o.x;resolveTile(room,p);addFeed(s,`${p.name} triggered OVERDRIVE!`);
 }else if(action.type==='scan'){p.score++;addFeed(s,`${p.name} scanned the grid (+1).`);
 }else if(action.type==='steal'){
  const rival=room.players.find(q=>q.id!==p.id&&dist(p.pos,q.pos)===1&&q.score>0);if(!rival)throw Error('No adjacent rival has points to steal');const amount=Math.min(2,rival.score);rival.score-=amount;p.score+=amount;addFeed(s,`${p.name} hijacked ${amount} point${amount===1?'':'s'} from ${rival.name}!`);
 }else throw Error('Unknown action');
 checkItemSpawns(room);
 if(p.score>=TARGET){s.over=true;s.winner=p.id;addFeed(s,`${p.name} wins the match!`);return;}
 s.turn=(s.turn+1)%room.players.length;if(s.turn===0)s.round++;
}
function tileValue(t){return t==='boost'?10:t==='core'?8:t==='portal'?3:t==='trap'?-2:0;}
function resolveTile(room,p){const s=room.state,i=p.pos,t=s.tiles[i];if(t==='core'){p.score+=2;s.tiles[i]='';addFeed(s,`${p.name} collected a data core (+2).`)}else if(t==='trap'){p.score=Math.max(0,p.score-1);s.tiles[i]='';addFeed(s,`${p.name} hit a signal trap (-1).`)}else if(t==='boost'){p.score+=3;s.tiles[i]='';addFeed(s,`${p.name} captured an overdrive cache (+3).`)}else if(t==='portal'){const dest=i===20?28:20;s.tiles[i]='';s.tiles[dest]='';if(!room.players.some(q=>q.id!==p.id&&q.pos===dest)){p.pos=dest;addFeed(s,`${p.name} warped through a portal.`)}else addFeed(s,'Portal exit blocked; both portals collapsed.');}}
module.exports={W,TARGET,MAX_PLAYERS,cleanName,newGame,publicRoom,movePlayer,dist};
