$(function(){
    var container = document.createElement('div');
    container.id = 'affinify-container';
    container.style.cssText = 'position:fixed!important;top:15px!important;right:200px!important;display:flex!important;gap:8px!important;z-index:99999!important';
    
    var ecosystem = document.createElement('div');
    ecosystem.id = 'ecosystem-beautiful';
    ecosystem.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
    ecosystem.style.cssText = 'width:40px!important;height:40px!important;background:#374151!important;color:#10b981!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;cursor:pointer!important;border:2px solid #10b981!important;transition:all 0.3s ease!important;flex-shrink:0!important';
    
    var credits = document.createElement('div');
    credits.id = 'credits-beautiful';
    credits.innerHTML = '<div style="display:flex;align-items:center;gap:6px;padding:0 8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg><span style="font-weight:600;font-size:14px;">9</span><span style="font-weight:500;font-size:12px;opacity:0.8;">Free</span></div>';
    credits.style.cssText = 'height:40px!important;background:#374151!important;color:#10b981!important;border-radius:8px!important;border:2px solid #10b981!important;transition:all 0.3s ease!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important';
    
    container.appendChild(ecosystem);
    container.appendChild(credits);
    document.body.appendChild(container);
    
    setInterval(function(){
        if(!document.getElementById('affinify-container')){
            document.querySelectorAll('[id*="credits"],[id*="ecosystem"],[id*="affinify"]').forEach(function(el){el.remove()});
            container = document.createElement('div');
            container.id = 'affinify-container';
            container.style.cssText = 'position:fixed!important;top:15px!important;right:200px!important;display:flex!important;gap:8px!important;z-index:99999!important';
            ecosystem = document.createElement('div');
            ecosystem.id = 'ecosystem-beautiful';
            ecosystem.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
            ecosystem.style.cssText = 'width:40px!important;height:40px!important;background:#374151!important;color:#10b981!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;cursor:pointer!important;border:2px solid #10b981!important;transition:all 0.3s ease!important;flex-shrink:0!important';
            credits = document.createElement('div');
            credits.id = 'credits-beautiful';
            credits.innerHTML = '<div style="display:flex;align-items:center;gap:6px;padding:0 8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg><span style="font-weight:600;font-size:14px;">9</span><span style="font-weight:500;font-size:12px;opacity:0.8;">Free</span></div>';
            credits.style.cssText = 'height:40px!important;background:#374151!important;color:#10b981!important;border-radius:8px!important;border:2px solid #10b981!important;transition:all 0.3s ease!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important';
            container.appendChild(ecosystem);
            container.appendChild(credits);
            document.body.appendChild(container);
        }
    }, 2000);
});