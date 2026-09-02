// تفعيل الصوت عند أول لمسة
let audioCtx = null;
let isMuted = false;

// إضافة مستمع لحدث النقر على كامل الصفحة لتفعيل الصوت
document.addEventListener('click', function initAudio() {
    if (audioCtx === null && !isMuted) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }
    // إزالة المستمع بعد أول نقرة حتى لا يتكرر
    document.removeEventListener('click', initAudio);
});

// دالة تشغيل الصوت
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

// زر كتم الصوت
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

// نافذة اختيار مشروع آخر
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

// اختيار الفئة المستهدفة
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

// التحقق من توافق الدولة والمدينة
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

// الدالة الرئيسية للإرسال
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

    // التحقق من البيانات
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
    resultDiv.innerText = "جاري تحليل البيانات الحقيقية...";

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
        if (data.result) {
            resultDiv.innerText = data.result;
        } else {
            resultDiv.innerText = "خطأ: " + (data.error || "حدث خطأ ما");
        }
    } catch (error) {
        resultDiv.innerText = "خطأ في الاتصال: " + error;
    } finally {
        submitButton.disabled = false;
        submitButton.innerText = "🚀 ابدأ تحليل المشروع";
    }
      }
