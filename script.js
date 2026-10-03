/**
 * ===================================================================
 * LUXURY WEDDING INVITATION — JAVASCRIPT ENGINE
 * 3D Envelope Unfolding Animation, Parallax Tilt & Classic Rich FX
 * ===================================================================
 */

(function () {
  'use strict';

  // State Management
  let isInvitationOpened = false;
  let isMusicPlaying = false;
  let isCardScratched = false;
  let audioContext = null;
  let proceduralMusicInterval = null;
  let customAudioElement = null;

  // DOM Elements
  const body = document.body;
  const coverHero = document.getElementById('coverHero');
  const envelopeSceneWrapper = document.getElementById('envelopeSceneWrapper');
  const envelopeContainer = document.getElementById('envelopeContainer');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const openInvitationBtn = document.getElementById('openInvitationBtn');
  const mainTiltCard = document.getElementById('mainTiltCard');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const scratchCanvas = document.getElementById('scratchCanvas');
  const scratchInstruction = document.getElementById('scratchInstruction');
  const stardustCanvas = document.getElementById('stardustCanvas');
  const petalCanvas = document.getElementById('petalCanvas');
  const btnAddToCalendar = document.getElementById('btnAddToCalendar');
  const btnShareInvite = document.getElementById('btnShareInvite');
  const btnScrollTop = document.getElementById('btnScrollTop');

  // =================================================================
  // 1. HYDRATE DOM FROM WEDDING_CONFIG
  // =================================================================
  function applyWeddingConfig() {
    if (typeof WEDDING_CONFIG === 'undefined') return;

    const { groom, bride, eventTitle, dateFormatted, dateNumeric, dayOfWeek, timeFormatted, timeNote, venue, texts, contact } = WEDDING_CONFIG;

    // Cover Screen & 3D Envelope
    safeSetText('peekEventTitle', eventTitle || 'WEDDING INVITATION');
    safeSetText('coverGroomName', (groom.name || 'AMEENUL ASHIF').toUpperCase());
    safeSetText('coverBrideName', (bride.name || 'SANA NAZRIN').toUpperCase());

    // Devbies-Style Main Card with Character-by-Character Animations
    animateCharactersInElement(document.getElementById('editorialMonogram'), `${groom.name.charAt(0)} & ${bride.name.charAt(0)}`, 0.2, 0.08);
    safeSetText('editorialQuote', texts.romanticQuote || "Two hearts, one journey, and a lifetime of cherished memories");
    safeSetText('editorialInviteLead', texts.requestHonourCaps || "REQUEST THE HONOR OF YOUR PRESENCE");
    safeSetText('groomParents', groom.parents || "S/o Mr. Asharaf & Mrs. Shareefa");
    safeSetText('brideParents', bride.parents || "D/o Mr. Sulaiman & Mrs. Naseema");
    animateCharactersInElement(document.getElementById('mainGroomName'), groom.name.toUpperCase(), 0.5, 0.05);
    animateCharactersInElement(document.getElementById('mainBrideName'), bride.name.toUpperCase(), 0.8, 0.05);
    safeSetText('triptychMonth', "DECEMBER");
    safeSetText('triptychDayYear', `${dayOfWeek}, 2026`);
    safeSetText('triptychDayNum', WEDDING_CONFIG.dayNumeric || "27");
    safeSetText('detailTimeFormatted', "11.00 - 3.00");
    safeSetText('detailVenueName', venue.name.toUpperCase());
    safeSetText('detailVenueCity', `${venue.city}, ${venue.district || ''}`);

    // Dua Seal & Messages
    safeSetText('textDuaArabic', texts.duaArabic);
    safeSetText('textDuaEnglish', texts.duaText);
    safeSetText('textPresenceNote', texts.presenceNote);
    safeSetText('textClosingPoem', texts.closingPoem);

    // Scratch Section
    safeSetText('revealedDateText', dateFormatted.toUpperCase());
    safeSetText('revealedTimeText', `${dayOfWeek.toUpperCase()} • ${timeFormatted}`);
    safeSetText('revealedVenueText', `${venue.name}, ${venue.city}`);
    safeSetText('scratchSuccessMsg', `✨ ${texts.scratchSuccess || 'WE CANNOT WAIT TO CELEBRATE WITH YOU!'} ✨`);

    // Countdown Section
    safeSetText('textCountdownHeading', texts.countdownHeading);
    safeSetText('textHolyQuoteAlt', texts.holyQuoteAlt);
    safeSetText('textHolyQuoteAltSource', texts.holyQuoteAltSource);

    // Venue & Location
    safeSetText('venueNameText', venue.name);
    safeSetText('venueCityText', `${venue.city}, ${venue.district || ''}`);
    safeSetText('venueCardTitle', venue.name);
    safeSetText('venueFullAddress', venue.fullAddress || `${venue.name}, ${venue.city}`);

    const mapLinkBtn = document.getElementById('btnMapDirections');
    if (mapLinkBtn && venue.mapLink) {
      mapLinkBtn.href = venue.mapLink;
    }

    // RSVP & Share
    safeSetText('textWillYouJoin', texts.willYouJoin);
    safeSetText('textWillYouJoinSub', texts.willYouJoinSub);

    const rsvpBtn = document.getElementById('btnWhatsAppRsvp');
    if (rsvpBtn && contact.whatsappNumber) {
      const cleanPhone = contact.whatsappNumber.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(contact.rsvpMessage || 'Assalamu Alaikum! Confirming our presence for the wedding celebration.');
      rsvpBtn.href = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    }

    // Footer
    safeSetText('footerCoupleName', `${groom.name.toUpperCase()} & ${bride.name.toUpperCase()}`);
    safeSetText('footerDateNumeric', dateNumeric);
  }

  function animateCharactersInElement(el, rawText, baseDelay = 0, speed = 0.045) {
    if (!el) return;
    const textToUse = rawText !== undefined ? rawText : (el.getAttribute('data-raw-text') || el.textContent);
    if (!textToUse) return;
    el.setAttribute('data-raw-text', textToUse);
    el.innerHTML = '';
    const chars = Array.from(textToUse);
    chars.forEach((ch, idx) => {
      const span = document.createElement('span');
      span.className = 'char-anim';
      span.style.setProperty('--char-idx', idx);
      span.style.setProperty('--anim-delay', `${(baseDelay + idx * speed).toFixed(3)}s`);
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
    });
  }

  function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) {
      el.textContent = text;
    }
  }

  // =================================================================
  // 2. LIVE COUNTDOWN TIMER
  // =================================================================
  function initCountdown() {
    const targetISO = WEDDING_CONFIG.weddingDateISO || '2026-12-20T11:00:00+05:30';
    const targetDate = new Date(targetISO).getTime();

    const daysEl = document.getElementById('timerDays');
    const hoursEl = document.getElementById('timerHours');
    const minsEl = document.getElementById('timerMinutes');
    const secsEl = document.getElementById('timerSeconds');

    function update() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // =================================================================
  // 3. CINEMATIC AUDIO ENGINE (MP3 + Procedural Harp Synth Fallback)
  // =================================================================
  function initAudioEngine() {
    const customSrc = WEDDING_CONFIG.audio && WEDDING_CONFIG.audio.customAudioSrc;
    if (customSrc && customSrc.trim() !== '') {
      customAudioElement = new Audio();
      customAudioElement.loop = true;
      customAudioElement.volume = 0.7;
      customAudioElement.preload = 'none';

      const sourceMp3 = document.createElement('source');
      sourceMp3.src = customSrc;
      sourceMp3.type = 'audio/mpeg';

      const sourceM4a = document.createElement('source');
      sourceM4a.src = 'assets/audio/wedding_nasheed.m4a';
      sourceM4a.type = 'audio/mp4';

      customAudioElement.appendChild(sourceMp3);
      customAudioElement.appendChild(sourceM4a);
    }
  }

  function startMusic() {
    if (isMusicPlaying) return;

    if (customAudioElement) {
      if (customAudioElement.preload === 'none') {
        customAudioElement.preload = 'auto';
        customAudioElement.load();
      }
      const playPromise = customAudioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isMusicPlaying = true;
          updateAudioButtonUI(true);
        }).catch(err => {
          console.warn('Audio autoplay requires gesture:', err);
          startProceduralHarpSynth();
        });
      }
      return;
    }

    startProceduralHarpSynth();
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      startMusic();
    }
  }

  function pauseMusic() {
    if (customAudioElement) {
      customAudioElement.pause();
    }
    if (proceduralMusicInterval) {
      clearInterval(proceduralMusicInterval);
      proceduralMusicInterval = null;
    }
    isMusicPlaying = false;
    updateAudioButtonUI(false);
  }

  function updateAudioButtonUI(playing) {
    if (audioToggleBtn) {
      if (playing) {
        audioToggleBtn.classList.add('playing');
      } else {
        audioToggleBtn.classList.remove('playing');
      }
    }
  }

  function startProceduralHarpSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      isMusicPlaying = true;
      updateAudioButtonUI(true);

      const chordNotes = [
        [293.66, 369.99, 440.00, 587.33], // D Maj
        [246.94, 293.66, 369.99, 493.88], // Bm / F#m
        [196.00, 246.94, 293.66, 392.00], // G Maj
        [220.00, 277.18, 329.63, 440.00]  // A Maj
      ];

      let chordIndex = 0;
      let noteStep = 0;

      function playHarpNote(freq, delaySec = 0) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + delaySec);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, audioContext.currentTime + delaySec);

        const now = audioContext.currentTime + delaySec;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      }

      proceduralMusicInterval = setInterval(() => {
        if (!isMusicPlaying) return;
        const currentChord = chordNotes[chordIndex];
        const freq = currentChord[noteStep % currentChord.length];
        playHarpNote(freq);

        noteStep++;
        if (noteStep % 4 === 0) {
          chordIndex = (chordIndex + 1) % chordNotes.length;
        }
      }, 480);

    } catch (e) {
      console.warn('Web Audio warning:', e);
    }
  }

  // =================================================================
  // 4. 3D ENVELOPE OPENING & CARD UNFOLDING ANIMATION
  // =================================================================
  let transitionTimeout = null;

  function finishOpeningTransition() {
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    if (coverHero && !coverHero.classList.contains('opened')) {
      coverHero.classList.add('opened');
      body.classList.remove('is-locked');

      const firstSection = document.getElementById('pinterestCardSection');
      if (firstSection) {
        firstSection.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(playVideoAnimation, 300);
    }
  }

  function openRoyalEnvelope() {
    if (isInvitationOpened) {
      finishOpeningTransition();
      return;
    }
    isInvitationOpened = true;

    // Start background music smoothly
    startMusic();

    // 1. Immediately fade out top spiritual header & action button to clear space
    if (envelopeSceneWrapper) {
      envelopeSceneWrapper.classList.add('is-opening');
    }

    if (envelopeContainer) {
      envelopeContainer.classList.add('is-unsealing');

      // 2. Open Flap smoothly in 3D (130ms)
      setTimeout(() => {
        if (envelopeContainer) {
          envelopeContainer.classList.add('is-flap-open');
        }
      }, 130);

      // 3. Slide Card Up Out of Envelope gracefully into clear space (360ms)
      setTimeout(() => {
        if (envelopeContainer) {
          envelopeContainer.classList.add('is-card-sliding');
        }
      }, 360);
    }

    // 4. Silky Transition from Cover to Main Invitation Card (980ms)
    transitionTimeout = setTimeout(() => {
      finishOpeningTransition();
    }, 980);
  }

  // =================================================================
  // 5. INTERACTIVE 3D PARALLAX TILT EFFECT (CLASSIC RICH FEEL)
  // =================================================================
  function initParallaxTilt() {
    if (!mainTiltCard) return;

    let isHovering = false;

    function handleMove(e) {
      if (!isHovering) return;
      const rect = mainTiltCard.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Gentle maximum 6 degree tilt for ultra-luxury feel
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      mainTiltCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    }

    function handleEnter() {
      isHovering = true;
      mainTiltCard.style.transition = 'transform 0.15s ease-out';
    }

    function handleLeave() {
      isHovering = false;
      mainTiltCard.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
      mainTiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }

    mainTiltCard.addEventListener('mouseenter', handleEnter);
    mainTiltCard.addEventListener('mousemove', handleMove);
    mainTiltCard.addEventListener('mouseleave', handleLeave);

    mainTiltCard.addEventListener('touchstart', handleEnter, { passive: true });
    mainTiltCard.addEventListener('touchmove', handleMove, { passive: true });
    mainTiltCard.addEventListener('touchend', handleLeave);
  }

  // =================================================================
  // 6. SCRATCH-TO-REVEAL CANVAS LOGIC
  // =================================================================
  function initScratchCard() {
    if (!scratchCanvas) return;
    const ctx = scratchCanvas.getContext('2d');
    const width = 340;
    const height = 230;

    scratchCanvas.width = width;
    scratchCanvas.height = height;

    drawScratchCover(ctx, width, height);

    let isDrawing = false;
    let lastPos = null;

    function getPosition(e) {
      const rect = scratchCanvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (width / rect.width),
        y: (clientY - rect.top) * (height / rect.height)
      };
    }

    function scratch(pos) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      if (lastPos) {
        ctx.lineWidth = 46;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      ctx.arc(pos.x, pos.y, 23, 0, Math.PI * 2, false);
      ctx.fill();
      lastPos = pos;
    }

    function checkScratchProgress() {
      if (isCardScratched) return;
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        let transparentCount = 0;
        for (let i = 3; i < data.length; i += 16) {
          if (data[i] === 0) transparentCount++;
        }
        const scratchedRatio = transparentCount / (data.length / 16);

        if (scratchedRatio > 0.40) {
          completeScratchReveal();
        }
      } catch (err) {
        console.warn('Scratch sample check error', err);
      }
    }

    function completeScratchReveal() {
      if (isCardScratched) return;
      isCardScratched = true;

      scratchCanvas.style.opacity = '0';
      scratchCanvas.style.pointerEvents = 'none';

      if (scratchInstruction) {
        scratchInstruction.innerHTML = '<span>✨ Auspicious Date Revealed! ✨</span>';
        scratchInstruction.classList.add('revealed');
      }
    }

    function startScratching(e) {
      if (isCardScratched) return;
      isDrawing = true;
      scratch(getPosition(e));
      e.preventDefault();
    }

    function handleMove(e) {
      if (!isDrawing || isCardScratched) return;
      scratch(getPosition(e));
      checkScratchProgress();
      e.preventDefault();
    }

    function endScratching() {
      isDrawing = false;
      lastPos = null;
      checkScratchProgress();
    }

    scratchCanvas.addEventListener('mousedown', startScratching);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', endScratching);

    scratchCanvas.addEventListener('touchstart', startScratching, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', endScratching);
  }

  function drawScratchCover(ctx, w, h) {
    // Luxury Metallic Gold Foil Gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#c5a059');
    grad.addColorStop(0.3, '#fbe39d');
    grad.addColorStop(0.5, '#deb452');
    grad.addColorStop(0.8, '#f5e4b2');
    grad.addColorStop(1, '#9b711e');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ornate gold border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Diamond motifs in corners
    ctx.fillStyle = '#ffffff';
    drawDiamond(ctx, 10, 10, 5);
    drawDiamond(ctx, w - 10, 10, 5);
    drawDiamond(ctx, 10, h - 10, 5);
    drawDiamond(ctx, w - 10, h - 10, 5);

    // Cover Text in Royal Burgundy
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5c1322';

    ctx.font = 'bold 11px Montserrat, sans-serif';
    ctx.fillText('✨ AUSPICIOUS REVEAL ✨', w / 2, h / 2 - 28);

    ctx.font = 'bold 21px "Cinzel", serif';
    ctx.fillText('SCRATCH HERE', w / 2, h / 2 + 4);

    ctx.font = '13px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = '#3d161d';
    ctx.fillText('Touch & scratch to reveal wedding date', w / 2, h / 2 + 28);
  }

  function drawDiamond(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
  }

  // =================================================================
  // 7. STARDUST & PETALS PARTICLES ENGINE (TUMBLING 3D ROSE PETALS)
  // =================================================================
  let stardustParticles = [];
  let petals = [];

  function initCanvases() {
    function resize() {
      if (stardustCanvas) {
        stardustCanvas.width = window.innerWidth;
        stardustCanvas.height = window.innerHeight;
      }
      if (petalCanvas) {
        petalCanvas.width = window.innerWidth;
        petalCanvas.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate ambient golden stardust particles
    const count = 35;
    for (let i = 0; i < count; i++) {
      stardustParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }

    // Seed continuous slow, tranquil drifting rose petals
    setInterval(() => {
      if (petals.length < 10) {
        spawnGentlePetal();
      }
    }, 1800);

    animateFX();
  }

  function spawnGentlePetal() {
    const colors = [
      '184, 107, 119', // Dusty rose
      '220, 160, 170', // Soft blush pink
      '248, 238, 240', // Rose ivory
      '212, 175, 55'   // Gold flake
    ];

    const isGold = Math.random() > 0.85;
    petals.push({
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 0.45 + 0.35,
      gravity: 0.004,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      size: Math.random() * 6 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      isGold: isGold,
      life: 450
    });
  }

  function animateFX() {
    // 1. Draw Stardust
    if (stardustCanvas) {
      const ctx = stardustCanvas.getContext('2d');
      ctx.clearRect(0, 0, stardustCanvas.width, stardustCanvas.height);

      for (let p of stardustParticles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.008;

        if (p.x < 0) p.x = stardustCanvas.width;
        if (p.x > stardustCanvas.width) p.x = 0;
        if (p.y < 0) p.y = stardustCanvas.height;
        if (p.y > stardustCanvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 220, 160, ${Math.max(0.1, Math.min(0.9, p.alpha))})`;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 2. Draw Tumbling Petals & Confetti
    if (petalCanvas && petals.length > 0) {
      const pCtx = petalCanvas.getContext('2d');
      pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

      for (let i = petals.length - 1; i >= 0; i--) {
        const pt = petals[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += pt.gravity;
        pt.angle += pt.rotSpeed;
        pt.life--;

        pCtx.save();
        pCtx.translate(pt.x, pt.y);
        pCtx.rotate(pt.angle);

        if (pt.isGold) {
          pCtx.fillStyle = `rgba(220, 180, 70, ${Math.min(1, pt.life / 100)})`;
          pCtx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 0.7);
        } else {
          pCtx.beginPath();
          pCtx.ellipse(0, 0, pt.size, pt.size * 0.65, 0, 0, Math.PI * 2);
          pCtx.fillStyle = `rgba(${pt.color}, ${Math.min(0.85, pt.life / 60)})`;
          pCtx.fill();
        }

        pCtx.restore();

        if (pt.life <= 0 || pt.y > petalCanvas.height + 25) {
          petals.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(animateFX);
  }

  // No explosive bursts — keeping presentation dignified, serene, and standard luxury
  function burstPetals() {
    // Intentionally no-op to eliminate all blast/explosion effects
  }

  // =================================================================
  // 8. CALENDAR (.ICS & GOOGLE CALENDAR) EXPORT
  // =================================================================
  function initCalendarActions() {
    if (!btnAddToCalendar) return;

    btnAddToCalendar.addEventListener('click', () => {
      const { groom, bride, venue, dateFormatted, timeFormatted } = WEDDING_CONFIG;
      const title = `Wedding: ${groom.name} & ${bride.name}`;
      const location = `${venue.name}, ${venue.city}, ${venue.district || ''}`;
      const description = `Wedding ceremony of ${groom.name} & ${bride.name} on ${dateFormatted} (${timeFormatted}) at ${venue.name}. Directions: ${venue.mapLink}`;

      let startDateUTC = '20261227T053000Z';
      let endDateUTC = '20261227T093000Z';
      if (WEDDING_CONFIG.weddingDateISO) {
        const start = new Date(WEDDING_CONFIG.weddingDateISO);
        const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
        startDateUTC = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        endDateUTC = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      }

      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateUTC}/${endDateUTC}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding Invitation//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `DTSTART:${startDateUTC}`,
        `DTEND:${endDateUTC}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `Wedding_${groom.shortName}_${bride.shortName}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        if (confirm('iCalendar event downloaded! Would you also like to add this to Google Calendar?')) {
          window.open(googleCalUrl, '_blank');
        }
      }, 500);
    });
  }

  // =================================================================
  // 9. SHARE INVITATION (Native Web Share & WhatsApp)
  // =================================================================
  function initShareAction() {
    if (!btnShareInvite) return;

    btnShareInvite.addEventListener('click', () => {
      const { groom, bride, contact } = WEDDING_CONFIG;
      const shareData = {
        title: `Wedding Invitation: ${groom.name} & ${bride.name}`,
        text: contact.shareMessage || `You're warmly invited to celebrate the joyous wedding of ${groom.name} & ${bride.name}!`,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {
          fallbackWhatsAppShare();
        });
      } else {
        fallbackWhatsAppShare();
      }
    });

    function fallbackWhatsAppShare() {
      const { contact } = WEDDING_CONFIG;
      const text = `${contact.shareMessage}\n${window.location.href}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  // =================================================================
  // 10. SCROLL REVEAL OBSERVER & BACK TO TOP
  // =================================================================
  function initScrollObservers() {
    const revealCards = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, {
        threshold: 0.12
      });

      revealCards.forEach(card => observer.observe(card));
    } else {
      revealCards.forEach(card => card.classList.add('is-visible'));
    }

    if (btnScrollTop) {
      btnScrollTop.addEventListener('click', () => {
        const firstCard = document.getElementById('pinterestCardSection');
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  // =================================================================
  // 11. CINEMATIC VIDEO-STYLE SEQUENTIAL OPENING ANIMATION ENGINE
  // =================================================================
  function playVideoAnimation() {
    const card = document.getElementById('mainTiltCard');
    const progressFill = document.getElementById('videoProgressFill');
    if (!card) return;

    // Reset animation state
    card.classList.remove('video-animating');
    if (progressFill) {
      progressFill.classList.remove('animating');
    }

    // Force browser reflow to re-trigger CSS animations cleanly from t=0
    void card.offsetWidth;

    // Trigger character-by-character letter cascade synced with cinematic timeline
    animateCharactersInElement(document.getElementById('editorialMonogram'), undefined, 0.6, 0.08);
    animateCharactersInElement(document.getElementById('mainGroomName'), undefined, 2.0, 0.05);
    animateCharactersInElement(document.getElementById('mainBrideName'), undefined, 2.3, 0.05);

    // Re-apply animation class
    card.classList.add('video-animating');
    if (progressFill) {
      void progressFill.offsetWidth;
      progressFill.classList.add('animating');
    }

    // Clean, dignified completion without explosive blasts
  }

  function initVideoAnimationControls() {
    const btnReplay = document.getElementById('btnReplayVideo');
    if (btnReplay) {
      btnReplay.addEventListener('click', (e) => {
        e.preventDefault();
        playVideoAnimation();
      });
    }
  }

  // =================================================================
  // INITIALIZATION ON DOM READY
  // =================================================================
  document.addEventListener('DOMContentLoaded', () => {
    applyWeddingConfig();
    initCountdown();
    initAudioEngine();
    initCanvases();
    initScratchCard();
    initParallaxTilt();
    initCalendarActions();
    initShareAction();
    initScrollObservers();
    initVideoAnimationControls();

    // Cover art card click listener
    const coverArtCard = document.getElementById('coverArtCard');
    if (coverArtCard) {
      coverArtCard.addEventListener('click', () => {
        openRoyalEnvelope();
      });
    }

    // Tap to open cue listener
    const sketchCardTapCue = document.getElementById('sketchCardTapCue');
    if (sketchCardTapCue) {
      sketchCardTapCue.addEventListener('click', (e) => {
        e.stopPropagation();
        openRoyalEnvelope();
      });
      sketchCardTapCue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          openRoyalEnvelope();
        }
      });
    }

    // Wax Seal click listener (if present)
    if (waxSealBtn) {
      waxSealBtn.addEventListener('click', openRoyalEnvelope);
    }

    // Open button listener
    if (openInvitationBtn) {
      openInvitationBtn.addEventListener('click', openRoyalEnvelope);
    }

    // Audio toggle
    if (audioToggleBtn) {
      audioToggleBtn.addEventListener('click', toggleMusic);
    }

    // Reminder button (trigger calendar save)
    const btnReminder = document.getElementById('btnReminder');
    if (btnReminder) {
      btnReminder.addEventListener('click', () => {
        const btnCal = document.getElementById('btnAddToCalendar');
        if (btnCal) btnCal.click();
      });
    }

    // Fast-forward listener if cover hero is clicked after opening starts
    if (coverHero) {
      coverHero.addEventListener('click', () => {
        if (isInvitationOpened) {
          finishOpeningTransition();
        }
      });
    }
  });

})();
