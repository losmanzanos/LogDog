/* Log Dog Timberworks: mobile menu and gallery lightbox. No dependencies. */
(function () {
  'use strict';

  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { btn.click(); btn.focus(); }
    });
  }

  // Lightbox
  var links = Array.prototype.slice.call(document.querySelectorAll('a.lb'));
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;

  var dlg = document.createElement('dialog');
  dlg.className = 'lbx';
  dlg.setAttribute('aria-label', 'Photo viewer');
  dlg.innerHTML =
    '<div class="lbx-inner">' +
      '<div class="lbx-top"><span class="label count" aria-live="polite"></span>' +
      '<button type="button" data-act="close">Close</button></div>' +
      '<div class="lbx-stage"><img alt=""></div>' +
      '<div class="lbx-bot"><p class="cap"></p>' +
      '<div class="nav-b"><button type="button" data-act="prev">Prev</button>' +
      '<button type="button" data-act="next">Next</button></div></div>' +
    '</div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('img');
  var cap = dlg.querySelector('.cap');
  var count = dlg.querySelector('.count');
  var idx = 0;
  var opener = null;

  function show(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx];
    var thumb = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = thumb ? thumb.getAttribute('alt') || '' : '';
    cap.textContent = a.getAttribute('data-caption') || '';
    count.textContent = (idx + 1) + ' / ' + links.length;
    // warm the neighbors
    [idx + 1, idx - 1].forEach(function (n) {
      var l = links[(n + links.length) % links.length];
      var pre = new Image(); pre.src = l.getAttribute('href');
    });
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      opener = a;
      show(i);
      if (!dlg.open) dlg.showModal();
    });
  });

  dlg.addEventListener('click', function (e) {
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (act === 'close') dlg.close();
    else if (act === 'next') show(idx + 1);
    else if (act === 'prev') show(idx - 1);
    else if (e.target === dlg || e.target.classList.contains('lbx-stage')) dlg.close();
  });

  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
  });

  dlg.addEventListener('close', function () {
    img.removeAttribute('src');
    if (opener) opener.focus();
  });

  // Touch swipe
  var x0 = null;
  dlg.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();

/* journal hover previews */
(function(){
  try{
    if(!window.matchMedia('(hover:hover)').matches) return;
    var rows=document.querySelectorAll('.jrow[data-preview]');
    if(!rows.length) return;
    var box=document.createElement('div');box.className='jprev';box.setAttribute('aria-hidden','true');
    var im=document.createElement('img');im.alt='';var cap=document.createElement('span');
    box.appendChild(im);box.appendChild(cap);document.body.appendChild(box);
    var x=0,y=0,raf=0;
    function place(){raf=0;var w=box.offsetWidth,h=box.offsetHeight;
      var px=Math.min(x+24,window.innerWidth-w-12),py=Math.max(12,Math.min(y-h/2,window.innerHeight-h-12));
      box.style.transform='translate('+px+'px,'+py+'px)';}
    function move(e){x=e.clientX;y=e.clientY;if(!raf)raf=requestAnimationFrame(place);}
    rows.forEach(function(r){
      var p=document.createElement('img');p.src=r.dataset.preview;/* warm cache on first pointer entry */
      r.addEventListener('mouseenter',function(e){
        im.src=r.dataset.preview;im.width=+r.dataset.pw;im.height=+r.dataset.ph;cap.textContent=r.dataset.pcap||'';
        move(e);box.classList.add('on');});
      r.addEventListener('mousemove',move);
      r.addEventListener('mouseleave',function(){box.classList.remove('on');});
    });
  }catch(e){}
})();
