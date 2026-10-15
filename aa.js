/* ==========================================================
   Gnaneshwar Dammu — Portfolio interactions & animations
   ========================================================== */
(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- Mobile menu ---------- */
    const menuToggle = $("#mobile-menu");
    const navLinks = $(".nav-links");
    const closeMenu = () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    };
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    $$(".nav-links a").forEach((l) => l.addEventListener("click", closeMenu));

    /* ---------- Scroll progress + header state ---------- */
    const progress = $("#progress");
    const header = $(".site-header");
    const sections = $$("main section[id]");
    let ticking = false;
    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        header.classList.toggle("scrolled", scrollY > 20);
        updateActiveNav();
        const sc = $("#scene");
        if (sc) sc.style.setProperty("--scene-o", Math.max(0.3, 0.62 - (scrollY / 900) * 0.32).toFixed(3));
        const tt = $("#to-top");
        if (tt) {
            tt.classList.toggle("show", scrollY > 600);
            tt.style.setProperty("--p", max > 0 ? (scrollY / max) * 100 : 0);
        }
        ticking = false;
    };
    addEventListener("scroll", () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });

    /* ---------- Active nav link ---------- */
    const setActiveNav = (id) => {
        $$(".nav-links a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
    };
    const updateActiveNav = () => {
        const marker = scrollY + header.offsetHeight + innerHeight * 0.3;
        const current = sections.reduce((active, section) => (
            section.offsetTop <= marker ? section : active
        ), sections[0]);
        if (current) setActiveNav(current.id);
    };
    addEventListener("hashchange", updateActiveNav);
    $$(".nav-links a").forEach((link) => link.addEventListener("click", () => {
        const id = link.getAttribute("href")?.slice(1);
        if (id) setActiveNav(id);
    }));
    updateActiveNav();
    onScroll();

    /* ---------- Scroll reveal (staggered) ---------- */
    const groups = [
        [".section-heading", 0], [".about-copy", 0], [".terminal", 0],
        [".experience-card", 0], [".skill-card", 1], [".project-card", 1],
        [".more-projects", 0], [".contact-inner", 0], [".marquee", 0],
    ];
    groups.forEach(([sel, stagger]) => {
        $$(sel).forEach((el, i) => {
            el.classList.add("reveal");
            if (sel === ".section-heading" && el.closest(".about-section, .experience-section")) el.classList.add("reveal-left");
            if (stagger) el.style.setProperty("--d", `${(i % 3) * 0.12}s`);
        });
    });
    const revealIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach((el) => revealIO.observe(el));

    /* ---------- Typing effect (hero) ---------- */
    const typedEl = $("#typed");
    const roles = ["Full-stack Developer", "Java & Spring Boot Engineer", "React Developer", "Problem Solver", "Always Building"];
    (async function typeLoop() {
        if (!typedEl) return;
        if (reduced) { typedEl.textContent = roles[0]; return; }
        let i = 0;
        while (true) {
            const word = roles[i % roles.length];
            for (let c = 1; c <= word.length; c++) { typedEl.textContent = word.slice(0, c); await sleep(70); }
            await sleep(1500);
            for (let c = word.length; c >= 0; c--) { typedEl.textContent = word.slice(0, c); await sleep(35); }
            await sleep(350);
            i++;
        }
    })();

    /* ---------- Counter ---------- */
    $$("[data-count]").forEach((el) => {
        const target = +el.dataset.count;
        const pad = +(el.dataset.pad || 0);
        const suffix = el.dataset.suffix || "";
        const render = (n) => (el.textContent = String(n).padStart(pad, "0") + suffix);
        if (reduced) return render(target);
        render(0);
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            io.disconnect();
            const start = performance.now(), dur = 1400;
            const step = (t) => {
                const p = Math.min((t - start) / dur, 1);
                render(Math.round(target * (1 - Math.pow(1 - p, 3))));
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
        io.observe(el);
    });

    /* ---------- Terminal typing ---------- */
    const termBody = $("#terminal-body");
    const termScript = [
        { cmd: "whoami" },
        { out: "dammu-gnaneshwar" },
        { cmd: "cat profile.json" },
        { out: `{\n  "role": "Full-stack Developer",\n  "backend": ["Java", "Spring Boot", "Node.js"],\n  "frontend": ["React", "TypeScript"],\n  "database": ["MySQL", "SQLite"],\n  "status": "open to opportunities"\n}`, json: true },
        { cmd: "git log --oneline -1" },
        { out: `<span class="k">a1b2c3d</span> keep building, keep shipping` },
    ];
    const highlight = (txt) => txt.replace(/("[^"]+")(\s*:)?/g, (m, s, c) => c ? `<span class="k">${s}</span>${c}` : `<span class="s">${s}</span>`);
    async function runTerminal() {
        termBody.textContent = "";
        for (const step of termScript) {
            const line = document.createElement("div");
            termBody.appendChild(line);
            if (step.cmd) {
                line.innerHTML = '<span class="t-prompt">gnaneshwar@portfolio:~$</span> <span class="typed-cmd"></span>';
                const target = $(".typed-cmd", line);
                if (reduced) target.textContent = step.cmd;
                else for (let i = 1; i <= step.cmd.length; i++) { target.textContent = step.cmd.slice(0, i); await sleep(55); }
                await sleep(reduced ? 0 : 280);
            } else {
                line.className = "out";
                line.innerHTML = step.json ? highlight(step.out) : step.out;
                await sleep(reduced ? 0 : 380);
            }
        }
        const last = document.createElement("div");
        last.innerHTML = '<span class="t-prompt">gnaneshwar@portfolio:~$</span> <span class="cursor"></span>';
        termBody.appendChild(last);
    }
    if (termBody) {
        const tio = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { tio.disconnect(); runTerminal(); }
        }, { threshold: 0.35 });
        tio.observe(termBody);
    }

    /* ---------- Card spotlight + subtle 3D tilt ---------- */
    if (canHover) {
        $$(".experience-card, .skill-card, .project-card").forEach((card) => {
            const tilt = !card.classList.contains("experience-card") && !reduced;
            const max = card.classList.contains("project-featured") ? 2 : 5;
            card.addEventListener("pointermove", (e) => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                card.style.setProperty("--mx", x + "px");
                card.style.setProperty("--my", y + "px");
                if (tilt) {
                    const rx = (y / r.height - 0.5) * -max;
                    const ry = (x / r.width - 0.5) * max;
                    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
                }
            });
            card.addEventListener("pointerleave", () => { card.style.transform = ""; });
        });
    }

    /* ---------- Cursor glow ---------- */
    const glow = $("#cursor-glow");
    if (glow && canHover && !reduced) {
        let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty;
        addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; glow.style.opacity = 1; }, { passive: true });
        (function loop() {
            x += (tx - x) * 0.12; y += (ty - y) * 0.12;
            glow.style.transform = `translate3d(${x - 280}px, ${y - 280}px, 0)`;
            requestAnimationFrame(loop);
        })();
    }

    /* ---------- Floating code snippets ---------- */
    const floatBox = $("#code-float");
    if (floatBox && !reduced) {
        const snippets = [
            "const dev = new Developer('Gnaneshwar');", "git commit -m \"ship it\"", "npm run build", "@RestController",
            "public static void main(String[] args)", "SELECT * FROM projects;", "useEffect(() => { build(); }, []);",
            "docker compose up -d", "POST /api/v1/hire", "{ \"status\": \"open_to_work\" }", "mvn spring-boot:run",
            "while (alive) { code(); }", "export default Portfolio;", "@Autowired UserService service;",
        ];
        const count = innerWidth < 800 ? 6 : 12;
        for (let i = 0; i < count; i++) {
            const s = document.createElement("span");
            s.textContent = snippets[i % snippets.length];
            s.style.left = Math.random() * 85 + "%";
            s.style.fontSize = 11 + Math.random() * 4 + "px";
            s.style.animationDuration = 24 + Math.random() * 22 + "s";
            s.style.animationDelay = -Math.random() * 40 + "s";
            floatBox.appendChild(s);
        }
    }

    /* ---------- Code rain canvas ---------- */
    const canvas = $("#bg-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const glyphs = "01{}[]()<>/\\=;:+-*&|!?$#@_~abcdefghijklmnopqrstuvwxyz".split("");
        const fs = 16;
        let w, h, cols, drops, speeds, active, mouseX = -999;
        const resize = () => {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            w = innerWidth; h = innerHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = "#070b10"; ctx.fillRect(0, 0, w, h);
            cols = Math.ceil(w / fs);
            drops = Array.from({ length: cols }, () => Math.random() * -(h / fs));
            speeds = Array.from({ length: cols }, () => 0.25 + Math.random() * 0.6);
            active = Array.from({ length: cols }, () => Math.random() < (w < 800 ? 0.4 : 0.6));
        };
        resize();
        addEventListener("resize", resize);
        addEventListener("pointermove", (e) => { mouseX = e.clientX; }, { passive: true });

        const draw = () => {
            ctx.fillStyle = "rgba(7, 11, 16, 0.16)";
            ctx.fillRect(0, 0, w, h);
            ctx.font = `${fs}px "JetBrains Mono", monospace`;
            for (let i = 0; i < cols; i++) {
                if (!active[i]) continue;
                const x = i * fs, y = drops[i] * fs;
                if (y > 0) {
                    const near = Math.abs(x - mouseX) < 90;
                    const r = Math.random();
                    ctx.fillStyle = r > 0.98 ? "#e6fff3" : near ? "#4dd8ff" : i % 9 === 0 ? "#a78bfa" : "#5cffb1";
                    ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], x, y);
                }
                if (y > h && Math.random() > 0.975) { drops[i] = 0; speeds[i] = 0.25 + Math.random() * 0.6; }
                drops[i] += speeds[i];
            }
        };

        if (reduced) {
            for (let i = 0; i < 90; i++) draw();
        } else {
            let last = 0, running = true;
            document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) requestAnimationFrame(frame); });
            const frame = (t) => {
                if (!running) return;
                if (t - last > 33) { draw(); last = t; }
                requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        }
    }

    /* ==========================================================
       v2 additions
       ========================================================== */

    /* ---------- Tag pop-in indices ---------- */
    $$(".tag-list").forEach((list) => $$("span", list).forEach((s, i) => s.style.setProperty("--ti", i)));

    /* ---------- Page transition navigation (replaces smooth scroll) ---------- */
    const hud = $("#pt-hud");
    const hudText = $("#pt-text");
    const ptStyles = ["flip", "spin", "tumble"];
    let ptIndex = 0, ptBusy = false;

    async function goTo(id) {
        const target = id === "home" ? null : document.getElementById(id);
        const headerHeight = header.getBoundingClientRect().height;
        const top = target
            ? Math.max(0, target.getBoundingClientRect().top + scrollY - headerHeight)
            : 0;
        if (reduced) { window.scrollTo({ top, behavior: "instant" }); return; }
        if (ptBusy) return;
        ptBusy = true;

        const els = [$("main"), $(".site-footer")];
        const style = ptStyles[ptIndex++ % ptStyles.length];
        const setPivot = (el) => { el.style.transformOrigin = `50% ${scrollY + innerHeight / 2 - el.offsetTop}px`; };

        els.forEach((el) => { el.dataset.pt = style; el.style.willChange = "transform, opacity"; setPivot(el); });
        hudText.textContent = id === "home" ? "cd ~" : `cd ./${id}`;
        hud.classList.add("show");
        els.forEach((el) => el.classList.add("pt-out"));
        await sleep(560);

        window.scrollTo({ top, behavior: "instant" });
        history.replaceState(null, "", id === "home" ? location.pathname : `#${id}`);
        els.forEach((el) => { el.classList.remove("pt-out"); el.classList.add("pt-prep"); setPivot(el); });
        void document.body.offsetWidth; // flush styles so the "in" animation starts from the prep state
        els.forEach((el) => { el.classList.remove("pt-prep"); el.classList.add("pt-in"); });
        hud.classList.remove("show");
        await sleep(850);

        els.forEach((el) => {
            el.classList.remove("pt-in");
            el.style.transformOrigin = ""; el.style.willChange = ""; delete el.dataset.pt;
        });
        if (target) {
            const maxScroll = document.documentElement.scrollHeight - innerHeight;
            const correctedTop = Math.min(
                maxScroll,
                Math.max(0, scrollY + target.getBoundingClientRect().top - headerHeight)
            );
            window.scrollTo({ top: correctedTop, behavior: "instant" });
        }
        ptBusy = false;
    }
    document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        const id = a.getAttribute("href").slice(1);
        if (!id || (id !== "home" && !document.getElementById(id))) return;
        e.preventDefault();
        goTo(id);
    });
    const toTop = $("#to-top");
    if (toTop) toTop.addEventListener("click", () => goTo("home"));

    /* ---------- Hero mouse parallax ---------- */
    const heroVisual = $(".hero-visual");
    if (heroVisual && canHover && !reduced) {
        const hero = $(".hero");
        hero.addEventListener("pointermove", (e) => {
            const r = hero.getBoundingClientRect();
            heroVisual.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5) * 2);
            heroVisual.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5) * 2);
        });
        hero.addEventListener("pointerleave", () => { heroVisual.style.setProperty("--px", 0); heroVisual.style.setProperty("--py", 0); });
    }

    /* ---------- Magnetic buttons ---------- */
    if (canHover && !reduced) {
        $$(".btn, .nav-cta, .social-links a, .project-footer a, #to-top").forEach((el) => {
            el.addEventListener("pointermove", (e) => {
                const r = el.getBoundingClientRect();
                el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.3}px ${(e.clientY - r.top - r.height / 2) * 0.4}px`;
            });
            el.addEventListener("pointerleave", () => { el.style.translate = ""; });
        });
    }

    /* ---------- Cursor code trail ---------- */
    if (canHover && !reduced) {
        const bits = ["{", "}", "</>", "();", "=>", "#", "0", "1", "[]", "&&", "//", "fn"];
        let lastTrail = 0;
        addEventListener("pointermove", (e) => {
            const now = performance.now();
            if (now - lastTrail < 75) return;
            lastTrail = now;
            const s = document.createElement("span");
            s.className = "trail";
            s.textContent = bits[(Math.random() * bits.length) | 0];
            s.style.left = e.clientX + 8 + "px";
            s.style.top = e.clientY + 8 + "px";
            s.style.setProperty("--dx", Math.random() * 44 - 22 + "px");
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 900);
        }, { passive: true });
    }

    /* ---------- Eyebrow scramble/decode ---------- */
    const scrambleChars = "01{}[]<>/=+*#$%&";
    $$(".section-heading .eyebrow, .contact-inner .eyebrow").forEach((el) => {
        const final = el.textContent;
        if (reduced) return;
        const io = new IntersectionObserver(([en]) => {
            if (!en.isIntersecting) return;
            io.disconnect();
            const start = performance.now(), dur = 900;
            const tick = (t) => {
                const p = Math.min((t - start) / dur, 1);
                const fixed = Math.floor(final.length * p);
                el.textContent = final.slice(0, fixed) + [...final.slice(fixed)].map((c) => c === " " || c === "—" ? c : scrambleChars[(Math.random() * scrambleChars.length) | 0]).join("");
                if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
            };
            requestAnimationFrame(tick);
        }, { threshold: 0.6 });
        io.observe(el);
    });

    /* ---------- Boot loader ---------- */
    (async function boot() {
        const loader = $("#loader");
        const ready = () => document.body.classList.add("loaded");
        if (!loader) return ready();
        if (reduced) { loader.remove(); return ready(); }
        const box = $("#loader-lines"), fill = $("#loader-fill"), pct = $("#loader-pct");
        const setP = (v) => { fill.style.width = v + "%"; pct.textContent = Math.round(v) + "%"; };
        const lines = ["> booting portfolio...", "> loading projects", "> compiling animations", "> ready_"];
        const pageLoaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
        let prog = 0, finished = false;
        (function tick() {
            if (finished) return;
            prog += (90 - prog) * 0.035; setP(prog);
            requestAnimationFrame(tick);
        })();
        const typeLines = (async () => {
            for (const l of lines) {
                const d = document.createElement("div"); d.textContent = l; box.appendChild(d);
                await sleep(430);
            }
        })();
        await Promise.all([sleep(1900), typeLines, Promise.race([pageLoaded, sleep(3500)])]);
        finished = true; setP(100);
        await sleep(280);
        loader.classList.add("done");
        ready();
        await sleep(1050);
        loader.remove();
    })();

    /* ---------- Vibe mode: view the developer scene on its own ---------- */
    const sceneEl = $("#scene");
    const sceneBtn = $("#scene-toggle");
    function setVibeMode(on) {
        document.body.classList.toggle("scene-mode", on);
        sceneBtn.setAttribute("aria-pressed", String(on));
        $("i", sceneBtn).className = on ? "fas fa-eye-slash" : "fas fa-eye";
        $("span", sceneBtn).textContent = on ? "Back to portfolio" : "Vibe mode";
        if (on && menuToggle) closeMenu();
    }
    if (sceneBtn) {
        sceneBtn.addEventListener("click", () => setVibeMode(!document.body.classList.contains("scene-mode")));
        addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("scene-mode")) setVibeMode(false); });
    }
    if (sceneEl && canHover && !reduced) {
        addEventListener("pointermove", (e) => {
            sceneEl.style.setProperty("--sx", ((e.clientX / innerWidth - 0.5) * 2).toFixed(3));
            sceneEl.style.setProperty("--sy", ((e.clientY / innerHeight - 0.5) * 2).toFixed(3));
        }, { passive: true });
    }
})();