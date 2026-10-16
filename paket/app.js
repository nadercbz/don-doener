/* DON DÖNER One Pager. GSAP ScrollSmoother + ScrollTrigger: Parallax über data-speed, Wort für Wort, Zähler, horizontale Präsentationen.
   Alle Bilder sind normale img (nicht lazy). Nach dem Dekodieren aller Bilder wird ScrollTrigger.refresh() ausgeführt.
   Auf dem Handy und bei reduzierter Bewegung: normales Scrollen ohne Smoother und ohne Pin. */
(function(){
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  var mobile = window.matchMedia("(max-width:900px)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var imgs = [].slice.call(document.images);
  var decodes = imgs.map(function(im){
    var d = (im.decode ? im.decode() : Promise.resolve()).catch(function(){});
    return Promise.race([d, new Promise(function(r){ setTimeout(r, 4000); })]);
  });
  var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(function(){}) : Promise.resolve();
  Promise.race([Promise.all(decodes.concat([fonts])), new Promise(function(r){ setTimeout(r, 7000); })]).then(start);

  function start(){
    if (!reduce && !mobile) ScrollSmoother.create({ wrapper:"#smooth-wrapper", content:"#smooth-content", smooth:1.1, smoothTouch:0.1, effects:true });

    gsap.from(".hero-in > *", { y:40, opacity:0, stagger:.12, duration:1.1, ease:"power3.out", delay:.1 });
    gsap.from(".f", { scale:.7, opacity:0, stagger:.1, duration:1.2, ease:"power3.out", delay:.3 });

    /* Wort für Wort */
    document.querySelectorAll(".reveal").forEach(function(el){
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">' + w + ' </span>'; }).join("");
      gsap.to(el.querySelectorAll(".w"), { opacity:1, stagger:.1, ease:"none", scrollTrigger:{ trigger:el, start:"top 80%", end:"bottom 50%", scrub:true } });
    });

    /* Zähler (nur Zählungen, keine Preise) */
    document.querySelectorAll("[data-n]").forEach(function(el){
      var to = +el.getAttribute("data-n"), o = { v:0 };
      gsap.to(o, { v:to, duration:1.6, ease:"power2.out", scrollTrigger:{ trigger:el, start:"top 90%", once:true }, onUpdate:function(){ el.textContent = Math.round(o.v); } });
    });

    /* Kapitel: Text und Bilder kommen hoch */
    gsap.utils.toArray(".ch-l, .z-l, .k-txt, .p-in h2, .ablauf h2").forEach(function(el){
      gsap.from(el, { y:50, opacity:0, duration:1, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 85%", once:true } });
    });
    gsap.utils.toArray(".zc, .pc, .steps li").forEach(function(el, i){
      gsap.from(el, { y:50, opacity:0, duration:.9, delay:(i % 3) * .08, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 90%", once:true } });
    });
    gsap.utils.toArray(".ch-r img, .k-ph img").forEach(function(im){
      gsap.fromTo(im, { scale:1.12 }, { scale:1, ease:"none", scrollTrigger:{ trigger:im.parentNode, start:"top bottom", end:"bottom top", scrub:true } });
    });
    var strip = document.querySelector(".strip-in");
    if (strip && !mobile) gsap.to(strip, { x:function(){ return -(strip.scrollWidth - window.innerWidth + 80); }, ease:"none", scrollTrigger:{ trigger:".strip", start:"top 85%", end:"bottom 15%", scrub:true, invalidateOnRefresh:true } });
    else if (strip) strip.parentNode.style.overflowX = "auto";

    /* Präsentationen horizontal (Desktop) */
    var tr = document.querySelector(".d-track");
    if (!mobile && tr){
      var dist = function(){ return Math.max(0, tr.scrollWidth - window.innerWidth + 20); };
      gsap.to(tr, { x:function(){ return -dist(); }, ease:"none", scrollTrigger:{ trigger:".d-pin", start:"top top", end:function(){ return "+=" + dist(); }, pin:true, scrub:true, invalidateOnRefresh:true } });
    }

    /* Menüleiste: auf hellen Flächen Blau */
    var barEl = document.querySelector(".bar"), lights = [].slice.call(document.querySelectorAll(".stm,.ch,.prod,.decks,.zahlen,.ablauf"));
    gsap.ticker.add(function(){
      var on = false;
      for (var k = 0; k < lights.length; k++){ var r = lights[k].getBoundingClientRect(); if (r.top < 46 && r.bottom > 46){ on = true; break; } }
      barEl.classList.toggle("on-light", on);
    });

    document.querySelectorAll('.bar a[href^="#"], .btn[href^="#"]').forEach(function(a){
      a.addEventListener("click", function(e){
        var t = document.querySelector(a.getAttribute("href")); if (!t) return;
        e.preventDefault(); var sm = ScrollSmoother.get();
        if (sm) sm.scrollTo(t, true, "top top"); else t.scrollIntoView({behavior:"smooth"});
      });
    });
    ScrollTrigger.refresh();
    window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
    setTimeout(function(){ ScrollTrigger.refresh(); }, 1200);
  }
})();
