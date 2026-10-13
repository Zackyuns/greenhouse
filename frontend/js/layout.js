document.addEventListener("DOMContentLoaded",()=>{
 const sidebar=document.querySelector(".sidebar");
 const toggle=document.querySelector(".menu-toggle");
 const backdrop=document.querySelector(".sidebar-backdrop");
 const closeSidebar=()=>{sidebar?.classList.remove("open");backdrop?.classList.remove("show");};
 toggle?.addEventListener("click",
 ()=>{sidebar?.classList.toggle("open");backdrop?.classList.toggle("show");});
 backdrop?.addEventListener("click",closeSidebar);
 document.querySelectorAll(".nav-item").forEach(item=>item.addEventListener("click",closeSidebar));
 function clock(){const now=new Date();const t=document.getElementById("sidebarClock");const d=document.getElementById("sidebarDate");if(t)t.textContent=now.toLocaleTimeString("id-ID");if(d)d.textContent=now.toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",
 year:"numeric"});}
 clock();setInterval(clock,1000);
 async function updateDeviceStatus(){
   let connected=false;
   try {
     const result=await apiRequest(`${API_URL}/system/status`);
     connected=Boolean(result.success && result.data && result.data.connected);
   } catch (_) { connected=false; }
   const label=document.getElementById("sidebarDeviceStatus");
   const dot=document.getElementById("sidebarStatusDot");
   if(label)label.textContent=connected?"Terhubung":"Terputus";
   if(dot)dot.className=connected?"dot online":"dot disconnected";
 }
 updateDeviceStatus();setInterval(updateDeviceStatus,5000);
});
