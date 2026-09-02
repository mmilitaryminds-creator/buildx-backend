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

// عداد الأحرف
const textarea = document.getElementById('projectDescription');
const charCount = document.getElementById('charCount');

textarea.addEventListener('input', function () {
    charCount.innerText = this.value.length + " / 60,000";
    if (this.value.length > 60000) {
        this.value = this.value.substring(0, 60000);
    }
});

// اختيار المشروع
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

// دالة عرض نتائج JSON بشكل احترافي
function displayResult(data) {
    const resultDiv = document.getElementById('analysisResult');
    resultDiv.style.display = 'block';

    const score = data.success_score;
    let scoreColor = '';
    if (score >= 70) scoreColor = '#22c55e'; // أخضر
    else if (score >= 40) scoreColor = '#eab308'; // أصفر
    else scoreColor = '#ef4444'; // أحمر

    const html = `
        <div class="dashboard-result">
            <div class="score-badge" style="background: ${scoreColor}">
                <span class="score-value">${score}%</span>
                <span class="score-label">فرصة النجاح</span>
            </div>
            <h3 style="text-align: center; margin: 20px 0;">${data.summary}</h3>
            
            <div class="result-section">
                <h4>🌍 الموقع</h4>
                <p><strong>الدولة:</strong> ${data.location.country}</p>
                <p><strong>المدينة:</strong> ${data.location.city}</p>
                <p><strong>السكان:</strong> ${data.location.population_country}</p>
                <p><strong>سكان المدينة:</strong> ${data.location.population_city}</p>
                <p><strong>التوقع:</strong> ${data.location.population_forecast}</p>
            </div>

            <div class="result-section">
                <h4>💰 تحليل الميزانية</h4>
                <p><strong>الميزانية:</strong> $${data.budget_analysis.budget}</p>
                <p><strong>ملاءمة:</strong> ${data.budget_analysis.suitability}</p>
                <ul>
                    ${Object.entries(data.budget_analysis.breakdown).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
                </ul>
            </div>

            <div class="result-section">
                <h4>📊 تحليل السوق</h4>
                <p><strong>مستوى الطلب:</strong> ${data.market_analysis.demand_level}</p>
                <p><strong>اتجاه السوق:</strong> ${data.market_analysis.trend}</p>
                <p><strong>الفئة المستهدفة:</strong> ${data.market_analysis.target_audience.join(', ')}</p>
            </div>

            <div class="result-section">
                <h4>🏪 المنافسة</h4>
                <p><strong>عدد المنافسين:</strong> ${data.competition.competitors_count}</p>
                <p><strong>مستوى المنافسة:</strong> ${data.competition.level}</p>
                <p>${data.competition.details}</p>
            </div>

            <div class="result-section">
                <h4>✅ الإيجابيات</h4>
                <ul>${data.pros.map(pro => `<li>${pro}</li>`).join('')}</ul>
            </div>

            <div class="result-section">
                <h4>⚠️ السلبيات</h4>
                <ul>${data.cons.map(con => `<li>${con}</li>`).join('')}</ul>
            </div>

            <div class="result-section">
                <h4>⚠️ المخاطر</h4>
                <ul>
                    ${data.risks.map(risk => `<li><strong>${risk.risk}:</strong> ${risk.level}</li>`).join('')}
                </ul>
            </div>

            <div class="result-section">
                <h4>🏙️ مدن بديلة</h4>
                <p><strong>المدينة الحالية:</strong> ${data.alternative_cities.current_city}</p>
                <p><strong>البديل المقترح:</strong> ${data.alternative_cities.suggested_city}</p>
                <p><strong>السبب:</strong> ${data.alternative_cities.reason}</p>
            </div>

            <div class="result-section">
                <h4>🤖 توصية BuildX</h4>
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                    <p><strong>${data.recommendation.decision}</strong></p>
                    <p>${data.recommendation.details}</p>
                </div>
            </div>

            <div class="result-section">
                <h4>📚 المصادر</h4>
                <ul>
                    ${data.sources.map(source => `<li>${source.source} — آخر تحديث: ${source.updated}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    resultDiv.innerHTML = html;
}

async function handleAnalysis() {
    const submitButton = document.getElementById('submitButton');
    const resultDiv = document.getElementById('analysisResult');

    const country = document.getElementById('country').value.trim();
    const city = document.getElementById('city').value.trim();
    const businessType = document.getElementById('businessType').value;
    const selectedProjectCard = document.querySelector('.project-card.selected');
    const customProject = document.getElementById('customProjectInput').value.trim();
    const selectedAudienceCard = document.querySelector('.audience-option.selected');
    const customAudience = document.getElementById('customAudience').value.trim();
    const budget = document.getElementById('budget').value;
    const description = textarea.value;

    // تحقق من البيانات
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

    // إرسال البيانات
    submitButton.disabled = true;
    submitButton.innerText = "جاري تجهيز التحليل...";
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="text-align: center; padding: 20px;">🔍 جاري التحليل...</div>';

    const projectData = {
        country: country,
        city: city,
        businessType: businessType,
        projectType: project,
        audience: audience,
        budget: budget
    };

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: description, projectData: projectData })
        });

        const data = await response.json();
        
        // إذا كان هناك خطأ جغرافي
        if (data.error === "geo_mismatch") {
            resultDiv.innerHTML = `<div style="background: #ef4444; padding: 20px; border-radius: 10px; text-align: center;">
                <h3>⚠️ تعذر إجراء التحليل</h3>
                <p>${data.message}</p>
            </div>`;
            submitButton.disabled = false;
            submitButton.innerText = "🚀 ابدأ تحليل المشروع";
            return;
        }

        // عرض النتائج الاحترافية
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
        submitButton.disabled = false;
        submitButton.innerText = "🚀 ابدأ تحليل المشروع";
    }
}
