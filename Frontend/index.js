// =============================================
//  TRAVEL GUIDE — index.js
//  Features: Dark Mode, Search, Download,
//  Copy, Share, Regenerate, Loading Steps
// =============================================

// --- Constants ---
const VOICES = {
  English: { Male: 'Matthew', Female: 'Alicia' },
  Hindi:   { Male: 'Aman',    Female: 'Namrita' },
  Tamil:   { Male: 'Murali',  Female: 'Iniya' },
  Telugu:  { Male: 'Zion',    Female: 'Josie' }
};

const LOCALES = {
  English: 'en-US',
  Hindi:   'hi-IN',
  Tamil:   'ta-IN',
  Telugu:  'te-IN'
};

// Known places with images for search
const KNOWN_PLACES = [
  { name: 'Taj Mahal',        image: 'https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Taj_Mahal_%28Edited%29.jpeg' },
  { name: 'Red Fort',         image: 'https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Delhi_fort.jpg' },
  { name: 'Gateway of India', image: 'https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Mumbai_03-2016_30_Gateway_of_India.jpg' },
  { name: 'Hawa Mahal',       image: 'https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg' },
  { name: 'Golden Temple',    image: 'https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/The_Golden_Temple_of_Amrithsar_7.jpg' },
  { name: 'Mysore Palace',    image: 'https://s3.ap-south-1.amazonaws.com/new-assets.ccbp.in/frontend/loading-data/niat-course-projects/Mysore_Palace_Morning.jpg' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop';

const GENERATE_AUDIO_GUIDE_API_URL = 'http://127.0.0.1:5000/generate-audio-guide';

// --- State ---
const state = {
  place: '',
  image: '',
  length: 'Summary',
  voice: 'Male',
  lastAudioBase64: null,
};

// --- DOM Elements ---
const cardsContainer     = document.querySelector('.cards');
const experiencePanel    = document.getElementById('experience');
const previewTitle       = document.getElementById('previewTitle');
const audioSection       = document.getElementById('audioSection');
const audioPlayer        = document.getElementById('audioPlayer');
const transcriptText     = document.getElementById('scriptText');
const generateButton     = document.getElementById('generateBtn');
const languageSelect     = document.getElementById('selectLanguage');
const closeButton        = document.getElementById('closeExperience');
const searchPreviewCard  = document.getElementById('searchPreviewCard');
const searchPreviewImage = document.getElementById('searchPreviewImage');
const searchPreviewTitle = document.getElementById('searchPreviewTitle');
const transcriptToggle   = document.getElementById('transcriptToggle');
const transcriptContent  = document.getElementById('transcriptContent');
const transcriptArrow    = document.getElementById('transcriptArrow');
const darkModeToggle     = document.getElementById('darkModeToggle');
const searchInput        = document.getElementById('searchInput');
const searchBtn          = document.getElementById('searchBtn');
const searchSuggestions  = document.getElementById('searchSuggestions');
const loadingSteps       = document.getElementById('loadingSteps');
const copyBtn            = document.getElementById('copyBtn');
const shareBtn           = document.getElementById('shareBtn');
const downloadBtn        = document.getElementById('downloadBtn');
const regenBtn           = document.getElementById('regenBtn');
const toast              = document.getElementById('toast');

// =============================================
//  🌙 DARK MODE
// =============================================
function applyDarkMode(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    darkModeToggle.textContent = '☀️';
    darkModeToggle.title = 'Switch to light mode';
  } else {
    document.documentElement.classList.remove('dark');
    darkModeToggle.textContent = '🌙';
    darkModeToggle.title = 'Switch to dark mode';
  }
}

// Load saved preference
const savedDark = localStorage.getItem('darkMode') === 'true';
applyDarkMode(savedDark);

darkModeToggle.addEventListener('click', () => {
  const isDark = !document.documentElement.classList.contains('dark');
  applyDarkMode(isDark);
  localStorage.setItem('darkMode', isDark);
});

// =============================================
//  🔔 TOAST
// =============================================
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// =============================================
//  🔍 SEARCH
// =============================================
function getSearchImage(query) {
  const match = KNOWN_PLACES.find(p => p.name.toLowerCase() === query.toLowerCase());
  return match ? match.image : FALLBACK_IMAGE;
}

function showSuggestions(query) {
  if (!query.trim()) {
    searchSuggestions.classList.remove('show');
    return;
  }
  const filtered = KNOWN_PLACES.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  if (filtered.length === 0) {
    searchSuggestions.classList.remove('show');
    return;
  }
  searchSuggestions.innerHTML = filtered.map(p =>
    `<div class="suggestion-item" data-name="${p.name}" data-image="${p.image}">🗺️ ${p.name}</div>`
  ).join('');
  searchSuggestions.classList.add('show');
}

searchInput.addEventListener('input', () => showSuggestions(searchInput.value));

searchSuggestions.addEventListener('click', (e) => {
  const item = e.target.closest('.suggestion-item');
  if (!item) return;
  searchInput.value = item.dataset.name;
  searchSuggestions.classList.remove('show');
  triggerSearch(item.dataset.name, item.dataset.image);
});

document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
    searchSuggestions.classList.remove('show');
  }
});

function triggerSearch(query, image = null) {
  const place = query.trim();
  if (!place) return;
  const img = image || getSearchImage(place);
  searchSuggestions.classList.remove('show');

  // Check if it matches a card exactly
  const matchedCard = [...document.querySelectorAll('.place-card:not(.search-preview-card)')].find(
    c => c.dataset.place && c.dataset.place.toLowerCase() === place.toLowerCase()
  );
  if (matchedCard) {
    selectDestination(matchedCard.dataset.place, matchedCard.dataset.image, matchedCard);
  } else {
    selectDestination(place, img, null);
  }
  searchInput.value = '';
}

searchBtn.addEventListener('click', () => triggerSearch(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') triggerSearch(searchInput.value);
});

// =============================================
//  📍 DESTINATION SELECT / DESELECT
// =============================================
function selectDestination(place, image, clickedCard = null) {
  state.place = place;
  state.image = image;
  state.lastAudioBase64 = null;

  previewTitle.textContent = place;
  cardsContainer.classList.add('faded');

  document.querySelectorAll('.place-card').forEach(c => c.classList.remove('active'));
  searchPreviewCard.classList.add('hidden');

  if (clickedCard) {
    clickedCard.classList.add('active');
  } else {
    searchPreviewImage.src = image;
    searchPreviewTitle.textContent = place;
    searchPreviewCard.classList.remove('hidden');
    searchPreviewCard.classList.add('active');
  }

  // Reset panel
  audioSection.classList.add('hidden');
  audioPlayer.src = '';
  transcriptText.textContent = '';
  generateButton.textContent = '🎧 Generate Audio Guide';
  generateButton.disabled = false;
  loadingSteps.classList.remove('active');
  resetLoadingSteps();

  experiencePanel.classList.remove('hidden');
  setTimeout(() => experiencePanel.classList.add('visible'), 10);
}

function deselectDestination() {
  experiencePanel.classList.remove('visible');
  setTimeout(() => {
    experiencePanel.classList.add('hidden');
    cardsContainer.classList.remove('faded');
    searchPreviewCard.classList.add('hidden');
    document.querySelectorAll('.place-card').forEach(c => c.classList.remove('active'));
  }, 300);
}

closeButton.addEventListener('click', deselectDestination);

document.querySelectorAll('.place-card:not(.search-preview-card)').forEach(card => {
  card.addEventListener('click', () => {
    selectDestination(card.dataset.place, card.dataset.image, card);
  });
});

// =============================================
//  ⏳ LOADING STEPS ANIMATION
// =============================================
function resetLoadingSteps() {
  ['step1', 'step2', 'step3'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active-step', 'done');
  });
}

function setStep(stepNum) {
  resetLoadingSteps();
  for (let i = 1; i < stepNum; i++) {
    document.getElementById(`step${i}`).classList.add('done');
  }
  if (stepNum <= 3) {
    document.getElementById(`step${stepNum}`).classList.add('active-step');
  }
}

// =============================================
//  🎚️ OPTION TOGGLES
// =============================================
const lengthButtons = document.querySelectorAll('[data-group="length"] button');
lengthButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    lengthButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.length = btn.dataset.value;
  });
});

const voiceButtons = document.querySelectorAll('[data-group="voice"] button');
voiceButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    voiceButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.voice = btn.dataset.value;
  });
});

// =============================================
//  🎧 GENERATE AUDIO GUIDE
// =============================================
async function generateAudioGuide() {
  generateButton.disabled = true;
  generateButton.textContent = '⏳ Working...';
  audioSection.classList.add('hidden');
  loadingSteps.classList.add('active');
  setStep(1);

  try {
    const selectedLanguage = languageSelect.value;
    const selectedVoice = state.voice;

    // Step 1 → Step 2 after short delay
    setTimeout(() => setStep(2), 1200);

    const response = await fetch(GENERATE_AUDIO_GUIDE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        place:      state.place,
        answerType: state.length,
        language:   selectedLanguage,
        voiceId:    VOICES[selectedLanguage][selectedVoice],
        locale:     LOCALES[selectedLanguage]
      })
    });

    if (!response.ok) throw new Error('Generation failed');

    setStep(3);
    const data = await response.json();

    transcriptText.textContent = data.description;
    state.lastAudioBase64 = data.audioBase64 || null;

    setTimeout(() => {
      loadingSteps.classList.remove('active');
      resetLoadingSteps();
      audioSection.classList.remove('hidden');

      if (data.audioBase64) {
        audioPlayer.src = `data:audio/mp3;base64,${data.audioBase64}`;
        audioPlayer.load();
        generateButton.textContent = '✅ Done! Regenerate';
      } else {
        generateButton.textContent = '⚠️ Audio not available';
      }
      generateButton.disabled = false;
    }, 600);

  } catch (err) {
    console.error(err);
    loadingSteps.classList.remove('active');
    resetLoadingSteps();
    generateButton.textContent = '🎧 Generate Audio Guide';
    generateButton.disabled = false;
    showToast('❌ Generation failed. Check your connection.');
  }
}

generateButton.addEventListener('click', generateAudioGuide);
regenBtn.addEventListener('click', generateAudioGuide);

// =============================================
//  📋 COPY TRANSCRIPT
// =============================================
copyBtn.addEventListener('click', () => {
  const text = transcriptText.textContent;
  if (!text) { showToast('⚠️ No transcript yet'); return; }
  navigator.clipboard.writeText(text)
    .then(() => showToast('📋 Transcript copied!'))
    .catch(() => showToast('❌ Copy failed'));
});

// =============================================
//  🔗 SHARE
// =============================================
shareBtn.addEventListener('click', () => {
  const text = transcriptText.textContent;
  if (!text) { showToast('⚠️ No content to share'); return; }

  if (navigator.share) {
    navigator.share({
      title: `Travel Guide: ${state.place}`,
      text: `🗺️ ${state.place}\n\n${text}\n\nGenerated by AI Travel Guide`,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`🗺️ ${state.place}\n\n${text}`)
      .then(() => showToast('🔗 Copied to clipboard!'))
      .catch(() => showToast('❌ Share failed'));
  }
});

// =============================================
//  ⬇️ DOWNLOAD AUDIO
// =============================================
downloadBtn.addEventListener('click', () => {
  if (!state.lastAudioBase64) { showToast('⚠️ No audio to download'); return; }
  const byteChars = atob(state.lastAudioBase64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: 'audio/mp3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.place.replace(/\s+/g, '_')}_guide.mp3`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('⬇️ Downloading audio...');
});

// =============================================
//  📄 TRANSCRIPT TOGGLE
// =============================================
transcriptToggle.addEventListener('click', () => {
  transcriptContent.classList.toggle('hidden');
  transcriptArrow.classList.toggle('rotate-180');
});
