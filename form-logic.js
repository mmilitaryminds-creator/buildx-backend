let audioCtx = null;
let isMuted = false;

document.addEventListener('click', function initAudio() {
    if (audioCtx === null && !isMuted) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }
    document.removeEventListener('click', initAudio);
});

function playClickSound() {
    if (isMuted) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (error) {}
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').innerText = isMuted ? '🔇' : '🔊';
}

const textarea = document.getElementById('projectDescription');
const charCount = document.getElementById('charCount');

textarea.addEventListener('input', function () {
    charCount.innerText = this.value.length + " / 60,000";
    if (this.value.length > 60000) {
        this.value = this.value.substring(0, 60000);
    }
});

function selectProject(element) {
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.remove('selected');
    });
    element.classList.add('selected');
    document.getElementById('customProjectInput').value = '';
    playClickSound();
}

function openModal() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('otherProjectCard').classList.add('selected');
    document.getElementById('customProjectModal').classList.add('show');
    document.getElementById('customProjectInput').focus();
    playClickSound();
}

function confirmCustomProject() {
    const customProject = document.getElementById('customProjectInput').value.trim();
    if (customProject === "") {
        alert("الرجاء إدخال اسم المشروع");
        return;
    }
    document.getElementById('customProjectInput').value = customProject;
    document.getElementById('customProjectModal').classList.remove('show');
    playClickSound();
}

function closeModal() {
    document.getElementById('customProjectModal').classList.remove('show');
    playClickSound();
}

function selectAudience(element) {
    document.querySelectorAll('.audience-option').forEach(option => {
        option.classList.remove('selected');
    });
    element.classList.add('selected');
    if (element.innerText === 'فئة أخرى') {
        document.getElementById('customAudience').style.display = 'block';
        document.getElementById('customAudience').focus();
    } else {
        document.getElementById('customAudience').style.display = 'none';
    }
    playClickSound();
}

function checkCompatibility() {
    const country = document.getElementById('country').value.trim().toLowerCase();
    const city = document.getElementById('city').value.trim().toLowerCase();

    const incompatibility = [
        { country: 'الجزائر', city: 'نيويورك' },
        { country: 'algeria', city: 'new york' },
        { country: 'الجزائر', city: 'باريس' },
        { country: 'algeria', city: 'paris' }
    ];

    const isIncompatible = incompatibility.some(item => 
        item.country === country && item.city === city
    );

    if (isIncompatible) {
        document.getElementById('cityError').innerText = "يبدو أن المدينة المختارة لا تتبع الدولة المحددة. يرجى التحقق من اختيار الدولة والمدينة.";
        document.getElementById('cityError').style.display = 'block';
    } else {
        document.getElementById('cityError').style.display = 'none';
    }
}

async function handleAnalysis() {
    const submitButton = document.getElementById('submitButton');
    const resultDiv = document.getElementById('analysisResult');

    // إظهار شاشة التحميل (داخل نفس الدالة)
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'analysisLoading';
    loadingDiv.style.cssText = 'display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(5,8,16,0.95); z-index:9999; align-items:center; justify-content:center; flex-direction:column; text-align:center;';
    loadingDiv.innerHTML = '<div style="width:80px; height:80px; border:6px solid #1e3a8a; border-top-color:#00a8ff; border-radius:50%; animation:aiLoaderSpin 1s linear infinite; margin-bottom:20px;"></div><h3 style="color:#fff; font-size:20px;">جاري تحليل المشروع...</h3><p style="color:#94a3b8; font-size:14px; margin-top:10px;">نقوم بجمع البيانات من مصادر متعددة...</p>';
    document.body.appendChild(loadingDiv);

    const country = document.getElementById('country').value.trim();
    const city = document.getElementById('city').value.trim();
    const businessType = document.getElementById('businessType').value;
    const selectedProjectCard = document.querySelector('.project-card.selected');
    const customProject = document.getElementById('customProjectInput').value.trim();
    const selectedAudienceCard = document.querySelector('.audience-option.selected');
    const customAudience = document.getElementById('customAudience').value.trim();
    const budget = document.getElementById('budget').value;
    const description = textarea.value;

    if (country === "") {
        document.getElementById('countryError').innerText = "يرجى اختيار الدولة أولًا.";
        document.getElementById('countryError').style.display = 'block';
        return;
    }
    if (city === "") {
        document.getElementById('cityError').innerText = "يرجى اختيار مدينة ضمن الدولة المحددة.";
        document.getElementById('cityError').style.display = 'block';
        return;
    }
    if (businessType === "") {
        alert("يرجى اختيار نوع النشاط");
        return;
    }
    if (!selectedProjectCard) {
        alert("الرجاء اختيار نوع المشروع");
        return;
    }
    const project = selectedProjectCard.dataset.value || customProject;
    if (project === "") {
        alert("الرجاء إدخال اسم المشروع الخاص بك");
        return;
    }
    if (!selectedAudienceCard) {
        alert("الرجاء اختيار الفئة المستهدفة");
        return;
    }
    const audience = selectedAudienceCard.innerText === 'فئة أخرى' ? customAudience : selectedAudienceCard.innerText;
    if (audience === "") {
        alert("الرجاء إدخال الفئة المستهدفة الخاصة بك");
        return;
    }
    if (budget === "" || isNaN(budget) || Number(budget) <= 0) {
        alert("الرجاء إدخال ميزانية صحيحة بالدولار الأمريكي");
        return;
    }

    submitButton.disabled = true;
    submitButton.innerText = "جاري تجهيز التحليل...";
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>جاري تحليل البيانات...</p></div>';

    const projectData = {
        country: country,
        city: city,
        businessType: businessType,
        projectType: project,
        audience: audience,
        budget: budget,
        area: document.getElementById('area').value
    };

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: description, projectData: projectData })
        });

        const data = await response.json();

        if (data.error === "geo_mismatch") {
            resultDiv.innerHTML = `<div style="background: #ef4444; padding: 20px; border-radius: 10px; text-align: center;">
                <h3>⚠️ تعذر إجراء التحليل</h3>
                <p>${data.message}</p>
            </div>`;
            const loadingElement = document.getElementById('analysisLoading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            submitButton.disabled = false;
            submitButton.innerText = "🚀 ابدأ تحليل المشروع";
            return;
        }

        if (data.result && typeof data.result === 'object') {
            displayResult(data.result);
        } else if (data.result) {
            resultDiv.innerHTML = data.result;
        } else {
            resultDiv.innerHTML = "خطأ: " + (data.error || "حدث خطأ ما");
        }
    } catch (error) {
        resultDiv.innerHTML = "خطأ في الاتصال: " + error;
    } finally {
        // إغلاق شاشة التحميل
        const loadingElement = document.getElementById('analysisLoading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        submitButton.disabled = false;
        submitButton.innerText = "🚀 ابدأ تحليل المشروع";
    }
}

// دالة عرض النتائج (قد لا تعمل إذا لم يرد AI بـ JSON منظم)
function displayResult(data) {
    const resultDiv = document.getElementById('analysisResult');
    resultDiv.style.display = 'block';

    const getColor = (score) => {
        if (score >= 70) return '#22c55e';
        if (score >= 40) return '#eab308';
        return '#ef4444';
    };

    const score = data.final_score;
    const indicators = data.indicators;

    const html = `
        <div class="dashboard-result">
            <div class="score-section">
                <h2 style="text-align: center; margin: 0;">🎯 التقييم النهائي</h2>
                <div class="score-circle" style="background: ${getColor(score)}">
                    <span class="score-number">${score}</span>
                    <span>/100</span>
                </div>
                <p style="text-align: center; font-weight: bold;">${data.final_label}</p>
                <p style="text-align: center; color: #666; font-size: 14px;">${data.final_verdict}</p>
            </div>
            
            <h3 style="margin-top: 30px;">📊 المؤشرات</h3>
            <div class="indicators-grid">
                ${Object.entries(indicators).map(([key, val]) => `
                    <div class="indicator-card">
                        <div class="indicator-title">${key}</div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${val.score}%; background: ${getColor(val.score)}"></div>
                        </div>
                        <div class="indicator-label">${val.label} (${val.score}/100)</div>
                        <div class="indicator-note">${val.note}</div>
                    </div>
                `).join('')}
            </div>

            <h3 style="margin-top: 30px;">📊 الإحصائيات الرئيسية</h3>
            <div class="stats-grid">
                ${Object.entries(data.key_metrics).map(([key, value]) => `
                    <div class="stat-card">
                        <div class="stat-title">${key}</div>
                        <div class="stat-value">${value}</div>
                    </div>
                `).join('')}
            </div>

            <h3 style="margin-top: 30px;">✅ نقاط القوة</h3>
            <ul class="pros-list">${data.pros.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3 style="margin-top: 30px;">⚠️ نقاط الضعف والمخاطر</h3>
            <ul class="cons-list">${data.cons.map(item => `<li>${item}</li>`).join('')}</ul>

            <h3 style="margin-top: 30px;">💡 التوصيات</h3>
            <div class="recommendations">
                ${data.recommendations.map(rec => `<div class="rec-item">${rec}</div>`).join('')}
            </div>

            <h3 style="margin-top: 30px;">🏆 أفضل المدن البديلة</h3>
            <div class="cities-grid">
                ${data.alternative_cities.map(city => `
                    <div class="city-card">
                        <strong>${city.city}</strong>
                        <div class="city-score">${city.score}/100</div>
                        <div class="city-reason">${city.reason}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="sources-section">
                <h4>📚 المصادر</h4>
                <p style="font-size: 13px; color: #888;">بيانات تقديرية بناءً على مؤشرات عامة. مصادر رسمية قد تختلف.</p>
            </div>
        </div>
    `;

    resultDiv.innerHTML = html;
}
