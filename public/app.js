const $=s=>document.querySelector(s);
const login=$("#loginScreen"), serversScreen=$("#serversScreen"), dash=$("#dashboard");
const servers=$("#servers"), approval=$("#approval"), serverName=$("#serverName");

async function me(){
  const r=await fetch("/api/me");
  if(!r.ok)return loadLogin();
  const u=await r.json();
  $("#account").innerHTML=`<span>${esc(u.global_name||u.username)}</span> <a class="btn" href="/logout">ĐĂNG XUẤT</a>`;
  login.classList.add("hidden"); serversScreen.classList.remove("hidden");
  loadServers();
}
function loadLogin(){login.classList.remove("hidden");serversScreen.classList.add("hidden");dash.classList.add("hidden")}
async function loadServers(){
  servers.innerHTML=`<div class="panel">Đang tải server...</div>`;
  const r=await fetch("/api/servers");
  if(!r.ok){servers.innerHTML=`<div class="panel">Không thể tải server.</div>`;return}
  const list=await r.json();
  if(!list.length){servers.innerHTML=`<div class="panel">Không có server phù hợp.</div>`;return}
  servers.innerHTML="";
  list.forEach(s=>{
    const b=document.createElement("button");b.className="card";
    const icon=s.icon?`<img src="https://cdn.discordapp.com/icons/${s.id}/${s.icon}.png?size=128">`:"";
    b.innerHTML=`${icon}<h3>${esc(s.name)}</h3><p>${s.owner?"Chủ server":"Có quyền quản lý"}</p>`;
    b.onclick=()=>selectServer(s);servers.appendChild(b);
  });
}
async function selectServer(s){
  await fetch(`/api/servers/${encodeURIComponent(s.id)}/select`,{method:"POST"});
  serverName.textContent=s.name;
  serversScreen.classList.add("hidden");dash.classList.remove("hidden");approval.classList.remove("hidden");
}
$("#refresh").onclick=loadServers;
$("#change").onclick=()=>{dash.classList.add("hidden");serversScreen.classList.remove("hidden");loadServers()};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");$("#"+b.dataset.tab).classList.add("active");
});
function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
const e=new URLSearchParams(location.search).get("error");
if(e==="oauth_failed"){$("#error").textContent="OAuth2 Discord thất bại.";$("#error").classList.remove("hidden")}
me();
