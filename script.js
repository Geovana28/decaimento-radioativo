/* ============================================
   RADIOACTIVE DECAY — ENGINE
   Atom visualization + Chart.js + Dating calc
   ============================================ */

(() => {
    'use strict';

    // --- State ---
    const state = {
        halfLife: 5730,
        name: 'Carbon-14',
        symbol: '¹⁴C',
        unit: 'years',
        use: 'Fossil dating up to ~50,000 years',
        numAtoms: 200,
        numHalves: 6,
        atoms: [],
        animating: false,
        animTime: 0,
    };

    // --- DOM ---
    const canvas = document.getElementById('atomCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = canvas.parentElement;

    const btnAnimate = document.getElementById('btnAnimate');
    const btnReset = document.getElementById('btnReset');

    const atomsSlider = document.getElementById('atomsSlider');
    const halvesSlider = document.getElementById('halvesSlider');
    const atomsValue = document.getElementById('atomsValue');
    const halvesValue = document.getElementById('halvesValue');

    const activeCount = document.getElementById('activeCount');
    const decayedCount = document.getElementById('decayedCount');

    const remainingSlider = document.getElementById('remainingSlider');
    const remainingPct = document.getElementById('remainingPct');
    const datingAge = document.getElementById('datingAge');
    const datingDetail = document.getElementById('datingDetail');
    const timelineFill = document.getElementById('timelineFill');
    const timelineMax = document.getElementById('timelineMax');
    const halfLifeLabel = document.getElementById('halfLifeLabel');

    const isotopeGrid = document.getElementById('isotopeGrid');
    const isotopeUse = document.getElementById('isotopeUse');

    const statHalfLife = document.getElementById('statHalfLife');
    const statLambda = document.getElementById('statLambda');
    const statAfter1 = document.getElementById('statAfter1');
    const statAfter5 = document.getElementById('statAfter5');
    const statMeanLife = document.getElementById('statMeanLife');
    const statActivity = document.getElementById('statActivity');

    // --- Canvas Setup ---
    let lastW = 0, lastH = 0;

    function resizeCanvas() {
        const rect = wrapper.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);
        if (w === lastW && h === lastH) return;
        lastW = w; lastH = h;
        canvas.width = w;
        canvas.height = h;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawAtoms();
    }

    window.addEventListener('resize', resizeCanvas);
    new ResizeObserver(() => resizeCanvas()).observe(wrapper);

    // --- Atom Management ---
    function initAtoms() {
        const cw = wrapper.clientWidth;
        const ch = wrapper.clientHeight;
        state.atoms = [];

        for (let i = 0; i < state.numAtoms; i++) {
            state.atoms.push({
                x: 15 + Math.random() * (cw - 30),
                y: 15 + Math.random() * (ch - 30),
                r: 5 + Math.random() * 3,
                active: true,
                decayTime: null,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                phase: Math.random() * Math.PI * 2,
            });
        }

        updateCounts();
    }

    function drawAtoms() {
        const cw = wrapper.clientWidth;
        const ch = wrapper.clientHeight;

        ctx.clearRect(0, 0, cw, ch);

        for (const atom of state.atoms) {
            // Subtle movement
            atom.x += atom.vx;
            atom.y += atom.vy;

            // Bounce
            if (atom.x < atom.r || atom.x > cw - atom.r) atom.vx *= -1;
            if (atom.y < atom.r || atom.y > ch - atom.r) atom.vy *= -1;
            atom.x = Math.max(atom.r, Math.min(cw - atom.r, atom.x));
            atom.y = Math.max(atom.r, Math.min(ch - atom.r, atom.y));

            if (atom.active) {
                // Active atom — neon green with glow
                const pulse = 0.7 + 0.3 * Math.sin(atom.phase + Date.now() * 0.002);
                const glow = ctx.createRadialGradient(atom.x, atom.y, 0, atom.x, atom.y, atom.r * 2.5);
                glow.addColorStop(0, `rgba(57, 255, 20, ${0.3 * pulse})`);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, atom.r * 2.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(atom.x, atom.y, atom.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(57, 255, 20, ${0.8 * pulse})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(atom.x, atom.y, atom.r * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * pulse})`;
                ctx.fill();
            } else {
                // Decayed atom — grey
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, atom.r * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(120, 144, 156, 0.25)';
                ctx.fill();
            }
        }
    }

    function updateCounts() {
        const active = state.atoms.filter(a => a.active).length;
        const decayed = state.atoms.length - active;
        activeCount.textContent = active;
        decayedCount.textContent = decayed;
    }

    // --- Animation ---
    let animFrame = null;
    let animStartTime = null;
    const ANIM_DURATION = 4000; // ms total for all half-lives

    function startAnimation() {
        if (state.animating) return;
        state.animating = true;
        initAtoms();
        animStartTime = Date.now();

        btnAnimate.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: pulse 1s infinite"><circle cx="12" cy="12" r="10"/></svg>
            Decaying...
        `;
        btnAnimate.disabled = true;

        animLoop();
    }

    function animLoop() {
        const elapsed = Date.now() - animStartTime;
        const progress = Math.min(elapsed / ANIM_DURATION, 1);

        // How many half-lives have passed in animation
        const halvesElapsed = progress * state.numHalves;

        // Fraction remaining
        const fraction = Math.pow(0.5, halvesElapsed);
        const targetActive = Math.round(state.numAtoms * fraction);

        // Decay atoms randomly until we reach target
        let currentActive = state.atoms.filter(a => a.active).length;
        while (currentActive > targetActive) {
            const activeAtoms = state.atoms.filter(a => a.active);
            if (activeAtoms.length === 0) break;
            const randIdx = Math.floor(Math.random() * activeAtoms.length);
            activeAtoms[randIdx].active = false;
            activeAtoms[randIdx].vx *= 0.3;
            activeAtoms[randIdx].vy *= 0.3;
            currentActive--;
        }

        updateCounts();
        drawAtoms();

        if (progress < 1) {
            animFrame = requestAnimationFrame(animLoop);
        } else {
            state.animating = false;
            btnAnimate.disabled = false;
            btnAnimate.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Animate Decay
            `;
        }
    }

    function resetAtoms() {
        if (animFrame) cancelAnimationFrame(animFrame);
        state.animating = false;
        btnAnimate.disabled = false;
        btnAnimate.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Animate Decay
        `;
        initAtoms();
        drawAtoms();
    }

    // --- Idle Animation Loop ---
    function idleLoop() {
        if (!state.animating) {
            drawAtoms();
        }
        requestAnimationFrame(idleLoop);
    }

    // --- Decay Chart ---
    const chartCtx = document.getElementById('decayChart').getContext('2d');
    const decayChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Remaining (%)',
                data: [],
                borderColor: '#39ff14',
                backgroundColor: 'rgba(57, 255, 20, 0.08)',
                fill: true,
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.3,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(13, 20, 22, 0.95)',
                    borderColor: 'rgba(57, 255, 20, 0.2)',
                    borderWidth: 1,
                    titleFont: { family: "'Inter', sans-serif", size: 12 },
                    bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
                    callbacks: {
                        label: (ctx) => `Remaining: ${ctx.parsed.y.toFixed(1)}%`,
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (half-lives)',
                        color: 'rgba(255,255,255,0.3)',
                        font: { family: "'Inter', sans-serif", size: 11 },
                    },
                    ticks: { color: 'rgba(255,255,255,0.25)', font: { family: "'JetBrains Mono', monospace", size: 9 } },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    border: { color: 'rgba(255,255,255,0.08)' },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Remaining (%)',
                        color: 'rgba(255,255,255,0.3)',
                        font: { family: "'Inter', sans-serif", size: 11 },
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.25)',
                        font: { family: "'JetBrains Mono', monospace", size: 9 },
                        callback: v => v + '%',
                    },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    border: { color: 'rgba(255,255,255,0.08)' },
                    min: 0, max: 105,
                },
            },
        },
    });

    function updateDecayChart() {
        const n = state.numHalves;
        const points = 200;
        const labels = [];
        const data = [];

        for (let i = 0; i <= points; i++) {
            const t = (i / points) * n;
            labels.push(t.toFixed(1));
            data.push(100 * Math.pow(0.5, t));
        }

        decayChart.data.labels = labels;
        decayChart.data.datasets[0].data = data;
        decayChart.options.scales.x.ticks.maxTicksLimit = 10;
        decayChart.update();
    }

    // --- Dating Calculator ---
    function formatTime(years) {
        if (years >= 1e9) return (years / 1e9).toFixed(2) + ' billion yr';
        if (years >= 1e6) return (years / 1e6).toFixed(2) + ' million yr';
        if (years >= 1e3) return (years / 1e3).toFixed(1) + 'K yr';
        if (years < 1) return (years * 365.25).toFixed(1) + ' days';
        return years.toFixed(1) + ' yr';
    }

    function updateDating() {
        const pct = parseFloat(remainingSlider.value);
        remainingPct.textContent = pct.toFixed(1) + '%';

        const fraction = pct / 100;
        const lambda = Math.LN2 / state.halfLife;
        const age = -Math.log(fraction) / lambda;
        const halvesElapsed = -Math.log2(fraction);

        datingAge.textContent = '≈ ' + formatTime(age) + ' old';
        datingDetail.textContent = halvesElapsed.toFixed(1) + ' half-lives have passed';

        // Timeline
        const maxTime = state.halfLife * 10;
        const fillPct = Math.min((age / maxTime) * 100, 100);
        timelineFill.style.width = fillPct + '%';
        timelineMax.textContent = formatTime(maxTime) + ' ago';
    }

    // --- Stats ---
    function updateStats() {
        const hl = state.halfLife;
        const lambda = Math.LN2 / hl;

        halfLifeLabel.textContent = 'Half-life: ' + formatTime(hl);
        statHalfLife.textContent = formatTime(hl);
        statLambda.textContent = lambda < 0.001 ? lambda.toExponential(2) : lambda.toFixed(4);
        statAfter1.textContent = '50.0%';
        statAfter5.textContent = (100 * Math.pow(0.5, 5)).toFixed(1) + '%';
        statMeanLife.textContent = formatTime(1 / lambda);
        statActivity.textContent = (lambda * state.numAtoms).toFixed(2) + '/t';

        isotopeUse.textContent = state.use;
    }

    // --- Event Listeners ---
    isotopeGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.isotope-btn');
        if (!btn) return;

        isotopeGrid.querySelectorAll('.isotope-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.halfLife = parseFloat(btn.dataset.halflife);
        state.name = btn.dataset.name;
        state.symbol = btn.dataset.symbol;
        state.unit = btn.dataset.unit;
        state.use = btn.dataset.use;

        updateAll();
    });

    atomsSlider.addEventListener('input', () => {
        state.numAtoms = parseInt(atomsSlider.value);
        atomsValue.textContent = state.numAtoms;
        resetAtoms();
        updateStats();
    });

    halvesSlider.addEventListener('input', () => {
        state.numHalves = parseInt(halvesSlider.value);
        halvesValue.textContent = state.numHalves;
        updateDecayChart();
    });

    remainingSlider.addEventListener('input', updateDating);

    btnAnimate.addEventListener('click', startAnimation);
    btnReset.addEventListener('click', resetAtoms);

    // --- Update All ---
    function updateAll() {
        updateDecayChart();
        updateDating();
        updateStats();
        resetAtoms();
    }

    // --- Init ---
    resizeCanvas();
    initAtoms();
    updateAll();
    idleLoop();

})();
