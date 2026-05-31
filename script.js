document.addEventListener('DOMContentLoaded', function() {
    const notebookTrigger = document.getElementById('notebookTrigger');
    const notebookOverlay = document.getElementById('notebookOverlay');
    const notebook = document.getElementById('notebook');
    const closeNotebook = document.getElementById('closeNotebook');
    const currentPageSpan = document.getElementById('currentPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const notebookTextarea = document.querySelector('.notebook-textarea');
    const saveBtn = document.getElementById('saveBtn');

    if (!notebookTrigger || !notebookOverlay) return;

    let currentPage = 1;
    const totalPages = 5;
    const pages = JSON.parse(localStorage.getItem('notebookPages')) || {};

    function saveToStorage() {
        localStorage.setItem('notebookPages', JSON.stringify(pages));
    }

    function saveCurrentPage() {
        if (notebookTextarea) pages[currentPage] = notebookTextarea.value;
    }

    function loadPage(page) {
        saveCurrentPage();
        currentPage = page;
        if (notebookTextarea) notebookTextarea.value = pages[page] || '';
        if (currentPageSpan) currentPageSpan.textContent = currentPage;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
    }

    function openNotebook() {
        notebookOverlay.classList.add('active');
        loadPage(1);
        if (notebookTextarea) notebookTextarea.focus();
    }

    function closeNotebookModal() {
        saveCurrentPage();
        saveToStorage();
        showSaveNotification();
        notebookOverlay.classList.remove('active');
    }

    function showSaveNotification() {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = '✓ 已保存';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    notebookTrigger.addEventListener('click', openNotebook);
    if (closeNotebook) closeNotebook.addEventListener('click', closeNotebookModal);
    if (notebookOverlay) {
        notebookOverlay.addEventListener('click', (e) => {
            if (e.target === notebookOverlay) {
                closeNotebookModal();
            }
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                loadPage(currentPage - 1);
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                loadPage(currentPage + 1);
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveCurrentPage();
            saveToStorage();
            showSaveNotification();
        });
    }

    window.addEventListener('beforeunload', () => {
        saveCurrentPage();
        saveToStorage();
    });

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    if (notebook) {
        notebook.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
            isDragging = true;
            const rect = notebook.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            notebook.style.position = 'fixed';
            notebook.style.left = rect.left + 'px';
            notebook.style.top = rect.top + 'px';
            notebook.style.transform = 'none';
        });

        notebook.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
            isDragging = true;
            const rect = notebook.getBoundingClientRect();
            dragOffsetX = e.touches[0].clientX - rect.left;
            dragOffsetY = e.touches[0].clientY - rect.top;
            notebook.style.position = 'fixed';
            notebook.style.left = rect.left + 'px';
            notebook.style.top = rect.top + 'px';
            notebook.style.transform = 'none';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !notebook) return;
        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;
        notebook.style.left = Math.max(0, Math.min(x, window.innerWidth - notebook.offsetWidth)) + 'px';
        notebook.style.top = Math.max(0, Math.min(y, window.innerHeight - notebook.offsetHeight)) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging || !notebook) return;
        const x = e.touches[0].clientX - dragOffsetX;
        const y = e.touches[0].clientY - dragOffsetY;
        notebook.style.left = Math.max(0, Math.min(x, window.innerWidth - notebook.offsetWidth)) + 'px';
        notebook.style.top = Math.max(0, Math.min(y, window.innerHeight - notebook.offsetHeight)) + 'px';
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    const lampTrigger = document.getElementById('lampTrigger');
    const lampImg = document.getElementById('lampImg');
    const deskBackground = document.querySelector('.desk-background');
    let lampOn = true;

    if (lampTrigger && lampImg) {
        lampTrigger.addEventListener('click', () => {
            lampOn = !lampOn;
            lampImg.src = lampOn ? 'assets/e.png' : 'assets/e1 (1).png';
            if (deskBackground) {
                deskBackground.style.backgroundImage = lampOn ? "url('assets/z.png')" : "url('assets/h.png')";
            }
        });
    }

    const calendarTrigger = document.getElementById('calendarTrigger');
    const calendarOverlay = document.getElementById('calendarOverlay');
    const calendar = document.getElementById('calendar');
    const closeCalendar = document.getElementById('closeCalendar');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarDays = document.getElementById('calendarDays');
    const scheduleDate = document.getElementById('scheduleDate');
    const scheduleInput = document.getElementById('scheduleInput');
    const saveScheduleBtn = document.getElementById('saveSchedule');

    let currentCalendarDate = new Date();
    let selectedDate = null;
    let schedules = {};

    try {
        schedules = JSON.parse(localStorage.getItem('calendarSchedules')) || {};
    } catch (e) {
        schedules = {};
    }

    function renderCalendar() {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        calendarTitle.textContent = year + '年 ' + monthNames[month];

        calendarDays.innerHTML = '';

        const today = new Date();
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = daysInPrevMonth - i;
            calendarDays.appendChild(day);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.textContent = i;

            const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
            if (dateStr === todayStr) {
                day.classList.add('today');
            }
            if (selectedDate === dateStr) {
                day.classList.add('selected');
            }
            if (schedules.hasOwnProperty(dateStr) && schedules[dateStr]) {
                day.classList.add('has-schedule');
            }

            day.addEventListener('click', () => selectDate(dateStr, day));
            calendarDays.appendChild(day);
        }

        const remainingDays = 42 - (firstDay + daysInMonth);
        for (let i = 1; i <= remainingDays; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = i;
            calendarDays.appendChild(day);
        }
    }

    function selectDate(dateStr, dayElement) {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        if (dayElement) {
            dayElement.classList.add('selected');
        }
        selectedDate = dateStr;
        scheduleDate.textContent = dateStr;
        scheduleInput.value = schedules[dateStr] || '';
    }

    function saveSchedule() {
        console.log('保存日程被调用');
        console.log('selectedDate:', selectedDate);
        console.log('scheduleInput:', scheduleInput ? scheduleInput.value : 'not found');
        if (!selectedDate) {
            showNotification('请先选择日期');
            return;
        }
        if (!scheduleInput || !scheduleInput.value.trim()) {
            showNotification('请输入日程内容');
            return;
        }
        schedules[selectedDate] = scheduleInput.value.trim();
        localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
        console.log('保存后的schedules:', schedules);
        showNotification('日程已保存');
        renderCalendar();
    }

    window.saveScheduleDirect = saveSchedule;

    function showNotification(msg) {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = '✓ ' + msg;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    if (calendarTrigger) {
        calendarTrigger.addEventListener('click', () => {
            selectedDate = null;
            scheduleInput.value = '';
            scheduleDate.textContent = '请选择日期';
            renderCalendar();
            calendarOverlay.classList.add('active');
        });
    }

    if (closeCalendar) {
        closeCalendar.addEventListener('click', () => {
            calendarOverlay.classList.remove('active');
        });
    }

    if (calendarOverlay) {
        calendarOverlay.addEventListener('click', (e) => {
            if (e.target === calendarOverlay) {
                calendarOverlay.classList.remove('active');
            }
        });
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', saveSchedule);
    }

    let calendarDragging = false;
    let calendarDragOffsetX = 0;
    let calendarDragOffsetY = 0;

    if (calendar) {
        calendar.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
            calendarDragging = true;
            const rect = calendar.getBoundingClientRect();
            calendarDragOffsetX = e.clientX - rect.left;
            calendarDragOffsetY = e.clientY - rect.top;
            calendar.style.position = 'fixed';
            calendar.style.left = rect.left + 'px';
            calendar.style.top = rect.top + 'px';
            calendar.style.transform = 'none';
        });

        calendar.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
            calendarDragging = true;
            const rect = calendar.getBoundingClientRect();
            calendarDragOffsetX = e.touches[0].clientX - rect.left;
            calendarDragOffsetY = e.touches[0].clientY - rect.top;
            calendar.style.position = 'fixed';
            calendar.style.left = rect.left + 'px';
            calendar.style.top = rect.top + 'px';
            calendar.style.transform = 'none';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!calendarDragging || !calendar) return;
        const x = e.clientX - calendarDragOffsetX;
        const y = e.clientY - calendarDragOffsetY;
        calendar.style.left = Math.max(0, Math.min(x, window.innerWidth - calendar.offsetWidth)) + 'px';
        calendar.style.top = Math.max(0, Math.min(y, window.innerHeight - calendar.offsetHeight)) + 'px';
    });

    document.addEventListener('mouseup', () => {
        calendarDragging = false;
    });

    document.addEventListener('touchmove', (e) => {
        if (!calendarDragging || !calendar) return;
        const x = e.touches[0].clientX - calendarDragOffsetX;
        const y = e.touches[0].clientY - calendarDragOffsetY;
        calendar.style.left = Math.max(0, Math.min(x, window.innerWidth - calendar.offsetWidth)) + 'px';
        calendar.style.top = Math.max(0, Math.min(y, window.innerHeight - calendar.offsetHeight)) + 'px';
    });

    document.addEventListener('touchend', () => {
        calendarDragging = false;
    });

    const readerTrigger = document.getElementById('readerTrigger');
    const readerOverlay = document.getElementById('readerOverlay');
    const reader = document.getElementById('reader');
    const closeReader = document.getElementById('closeReader');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const bookPreview = document.getElementById('bookPreview');
    const bookCover = document.getElementById('bookCover');
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
    const bookDesc = document.getElementById('bookDesc');
    const readBtn = document.getElementById('readBtn');
    const previewBody = document.getElementById('previewBody');

    if (readerTrigger) {
        readerTrigger.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.innerHTML = '';
            bookPreview.style.display = 'none';
            readerOverlay.classList.add('active');
        });
    }

    if (closeReader) {
        closeReader.addEventListener('click', () => {
            readerOverlay.classList.remove('active');
        });
    }

    if (readerOverlay) {
        readerOverlay.addEventListener('click', (e) => {
            if (e.target === readerOverlay) {
                readerOverlay.classList.remove('active');
            }
        });
    }

    function searchBooks(query) {
        if (!query.trim()) return;
        searchResults.innerHTML = '<div class="loading">搜索中...</div>';
        bookPreview.style.display = 'none';

        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`;

        const proxyUrls = [
            `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`
        ];

        let tried = 0;

        function tryFetch(url) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                });
        }

        tryFetch(proxyUrls[tried])
            .then(data => {
                displaySearchResults(data.docs);
            })
            .catch(error => {
                console.error('Search error:', error);
                tried++;
                if (tried < proxyUrls.length) {
                    tryFetch(proxyUrls[tried])
                        .then(data => {
                            displaySearchResults(data.docs);
                        })
                        .catch(err => {
                            console.error('All proxies failed:', err);
                            searchResults.innerHTML = '<div class="no-results">搜索失败，请稍后重试<br>或尝试刷新页面</div>';
                        });
                } else {
                    searchResults.innerHTML = '<div class="no-results">搜索失败，请稍后重试<br>或尝试刷新页面</div>';
                }
            });
    }

    function displaySearchResults(docs) {
        if (!docs || docs.length === 0) {
            searchResults.innerHTML = '<div class="no-results">没有找到相关书籍</div>';
            return;
        }

        searchResults.innerHTML = '';
        docs.forEach(book => {
            const coverId = book.cover_i;
            const coverUrl = coverId
                ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                : '';

            const title = book.title || '未知书名';
            const author = book.author_name ? book.author_name.join(', ') : '未知作者';

            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <img src="${coverUrl}" alt="${title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 150%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22150%22/><text x=%2250%22 y=%2275%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2210%22>无封面</text></svg>'">
                <div class="book-item-title">${title}</div>
                <div class="book-item-author">${author}</div>
            `;

            bookItem.addEventListener('click', () => showBookPreview(book, coverUrl));
            searchResults.appendChild(bookItem);
        });
    }

    function showBookPreview(book, coverUrl) {
        const title = book.title || '未知书名';
        const author = book.author_name ? book.author_name.join(', ') : '未知作者';
        const desc = book.first_sentence ? (Array.isArray(book.first_sentence) ? book.first_sentence[0] : book.first_sentence) : '暂无描述';
        const key = book.key;

        bookCover.src = coverUrl || '';
        bookTitle.textContent = title;
        bookAuthor.textContent = author;
        bookDesc.textContent = desc.substring(0, 150) + (desc.length > 150 ? '...' : '');

        readBtn.onclick = () => {
            if (key) {
                const readerUrl = `https://openlibrary.org${key}`;
                window.open(readerUrl, '_blank');
            }
        };

        previewBody.innerHTML = '';
        bookPreview.style.display = 'block';
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchBooks(searchInput.value);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBooks(searchInput.value);
            }
        });
    }

    let readerDragging = false;
    let readerDragOffsetX = 0;
    let readerDragOffsetY = 0;

    if (reader) {
        reader.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
            readerDragging = true;
            const rect = reader.getBoundingClientRect();
            readerDragOffsetX = e.clientX - rect.left;
            readerDragOffsetY = e.clientY - rect.top;
            reader.style.position = 'fixed';
            reader.style.left = rect.left + 'px';
            reader.style.top = rect.top + 'px';
            reader.style.transform = 'none';
        });

        reader.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
            readerDragging = true;
            const rect = reader.getBoundingClientRect();
            readerDragOffsetX = e.touches[0].clientX - rect.left;
            readerDragOffsetY = e.touches[0].clientY - rect.top;
            reader.style.position = 'fixed';
            reader.style.left = rect.left + 'px';
            reader.style.top = rect.top + 'px';
            reader.style.transform = 'none';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!readerDragging || !reader) return;
        const x = e.clientX - readerDragOffsetX;
        const y = e.clientY - readerDragOffsetY;
        reader.style.left = Math.max(0, Math.min(x, window.innerWidth - reader.offsetWidth)) + 'px';
        reader.style.top = Math.max(0, Math.min(y, window.innerHeight - reader.offsetHeight)) + 'px';
    });

    document.addEventListener('mouseup', () => {
        readerDragging = false;
    });

    document.addEventListener('touchmove', (e) => {
        if (!readerDragging || !reader) return;
        const x = e.touches[0].clientX - readerDragOffsetX;
        const y = e.touches[0].clientY - readerDragOffsetY;
        reader.style.left = Math.max(0, Math.min(x, window.innerWidth - reader.offsetWidth)) + 'px';
        reader.style.top = Math.max(0, Math.min(y, window.innerHeight - reader.offsetHeight)) + 'px';
    });

    document.addEventListener('touchend', () => {
        readerDragging = false;
    });

    const timerTrigger = document.getElementById('timerTrigger');
    const timerOverlay = document.getElementById('timerOverlay');
    const timer = document.getElementById('timer');
    const closeTimer = document.getElementById('closeTimer');
    const timerSetup = document.getElementById('timerSetup');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerComplete = document.getElementById('timerComplete');
    const timeInput = document.getElementById('timeInput');
    const decreaseTime = document.getElementById('decreaseTime');
    const increaseTime = document.getElementById('increaseTime');
    const startTimer = document.getElementById('startTimer');
    const timerTime = document.getElementById('timerTime');
    const timerProgress = document.getElementById('timerProgress');
    const timerStatus = document.getElementById('timerStatus');
    const pauseTimer = document.getElementById('pauseTimer');
    const resetTimer = document.getElementById('resetTimer');
    const doneTimer = document.getElementById('doneTimer');
    const completedMins = document.getElementById('completedMins');
    const timerFloatDisplay = document.getElementById('timerFloatDisplay');
    const timerFloatEmoji = document.getElementById('timerFloatEmoji');
    const timerFloatTime = document.getElementById('timerFloatTime');

    let timerInterval = null;
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let isPaused = false;
    let completedSeconds = 0;
    let timerStartTime = null;
    let pausedElapsed = 0;

    const circumference = 2 * Math.PI * 45;

    function saveTimerState() {
        const state = {
            totalSeconds,
            remainingSeconds,
            isPaused,
            completedSeconds,
            timerStartTime,
            pausedElapsed,
            isRunning: timerInterval !== null
        };
        localStorage.setItem('timerState', JSON.stringify(state));
    }

    function loadTimerState() {
        const saved = localStorage.getItem('timerState');
        if (saved) {
            const state = JSON.parse(saved);
            if (state.isRunning && state.timerStartTime) {
                totalSeconds = state.totalSeconds;
                const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
                remainingSeconds = Math.max(0, totalSeconds - elapsed - state.pausedElapsed);
                completedSeconds = elapsed + state.pausedElapsed;
                isPaused = state.isPaused;
                return true;
            }
        }
        return false;
    }

    if (timerTrigger) {
        timerTrigger.addEventListener('click', () => {
            const hadExistingTimer = loadTimerState() && remainingSeconds > 0;
            if (hadExistingTimer && !timerInterval) {
                timerSetup.style.display = 'none';
                timerDisplay.style.display = 'block';
                timerComplete.style.display = 'none';
                pauseTimer.textContent = isPaused ? '继续' : '暂停';
                timerStatus.textContent = isPaused ? '已暂停' : '专注中...';
                updateTimerDisplay();
                updateProgress();
                startTimerCountdown(false);
            } else if (!hadExistingTimer) {
                resetTimerState();
            }
            timerOverlay.classList.add('active');
        });
    }

    if (closeTimer) {
        closeTimer.addEventListener('click', () => {
            closeTimerModal();
        });
    }

    if (timerOverlay) {
        timerOverlay.addEventListener('click', (e) => {
            if (e.target === timerOverlay) {
                closeTimerModal();
            }
        });
    }

    if (decreaseTime) {
        decreaseTime.addEventListener('click', () => {
            let val = parseInt(timeInput.value) || 1;
            if (val > 1) timeInput.value = val - 1;
        });
    }

    if (increaseTime) {
        increaseTime.addEventListener('click', () => {
            let val = parseInt(timeInput.value) || 1;
            if (val < 120) timeInput.value = val + 1;
        });
    }

    if (startTimer) {
        startTimer.addEventListener('click', () => {
            const minutes = parseInt(timeInput.value) || 25;
            totalSeconds = minutes * 60;
            remainingSeconds = totalSeconds;
            completedSeconds = 0;
            startTimerCountdown();
        });
    }

    if (pauseTimer) {
        pauseTimer.addEventListener('click', () => {
            if (isPaused) {
                resumeTimer();
            } else {
                pauseTimerCountdown();
            }
        });
    }

    if (resetTimer) {
        resetTimer.addEventListener('click', () => {
            resetTimerState();
        });
    }

    if (doneTimer) {
        doneTimer.addEventListener('click', () => {
            closeTimerModal();
        });
    }

    function startTimerCountdown(isNew = true) {
        timerSetup.style.display = 'none';
        timerDisplay.style.display = 'block';
        timerComplete.style.display = 'none';
        isPaused = false;
        pauseTimer.textContent = '暂停';
        updateTimerDisplay();
        timerProgress.style.strokeDasharray = circumference;
        timerProgress.style.strokeDashoffset = 0;
        showFloatDisplay();

        if (isNew) {
            timerStartTime = Date.now();
            pausedElapsed = 0;
        }

        timerInterval = setInterval(() => {
            if (!isPaused) {
                remainingSeconds--;
                completedSeconds++;
                updateTimerDisplay();
                updateProgress();
                saveTimerState();

                if (remainingSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    timerComplete.classList.add('completed');
                    showCompletion();
                    localStorage.removeItem('timerState');
                }
            }
        }, 1000);
    }

    function pauseTimerCountdown() {
        isPaused = true;
        pausedElapsed = completedSeconds;
        timerStartTime = Date.now();
        pauseTimer.textContent = '继续';
        timerStatus.textContent = '已暂停';
        saveTimerState();
    }

    function resumeTimer() {
        isPaused = false;
        timerStartTime = Date.now();
        pauseTimer.textContent = '暂停';
        timerStatus.textContent = '专注中...';
        saveTimerState();
    }

    function updateTimerDisplay() {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        timerTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        updateFloatDisplay();
    }

    function updateFloatDisplay() {
        if (!timerFloatDisplay || !timerFloatEmoji || !timerFloatTime) return;
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        timerFloatTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const completionRate = totalSeconds > 0 ? completedSeconds / totalSeconds : 0;
        if (completionRate >= 1) {
            timerFloatEmoji.textContent = '🌟';
        } else if (completionRate >= 0.7) {
            timerFloatEmoji.textContent = '😊';
        } else if (completionRate >= 0.4) {
            timerFloatEmoji.textContent = '😐';
        } else {
            timerFloatEmoji.textContent = '😢';
        }
    }

    function showFloatDisplay() {
        if (timerFloatDisplay) {
            timerFloatDisplay.style.display = 'flex';
        }
    }

    function hideFloatDisplay() {
        if (timerFloatDisplay) {
            timerFloatDisplay.style.display = 'none';
        }
    }

    function updateProgress() {
        const progress = completedSeconds / totalSeconds;
        const offset = circumference * (1 - progress);
        timerProgress.style.strokeDashoffset = offset;
    }

    function showCompletion() {
        timerDisplay.style.display = 'none';
        timerComplete.style.display = 'block';
        const completed = Math.floor(completedSeconds / 60);
        completedMins.textContent = completed;
        updatePlantMood(completed / Math.floor(totalSeconds / 60));
        hideFloatDisplay();
        playCompletionSound();
    }

    function playCompletionSound() {
        try {
            const audio = new Audio('assets/ying.wav');
            audio.play().catch(e => console.log('音频播放失败:', e));
        } catch (e) {
            console.log('音频播放失败:', e);
        }
    }

    function resetTimerState() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        totalSeconds = 0;
        remainingSeconds = 0;
        completedSeconds = 0;
        isPaused = false;
        timerStartTime = null;
        pausedElapsed = 0;
        timerSetup.style.display = 'block';
        timerDisplay.style.display = 'none';
        timerComplete.style.display = 'none';
        pauseTimer.textContent = '暂停';
        timerStatus.textContent = '专注中...';
        hideFloatDisplay();
        localStorage.removeItem('timerState');
    }

    function closeTimerModal() {
        if (timerInterval) {
            saveTimerState();
        }
        timerOverlay.classList.remove('active');
        if (remainingSeconds > 0 || completedSeconds > 0) {
            updatePlantMood(completedSeconds / totalSeconds);
        }
        setTimeout(() => {
            if (!timerInterval) {
                resetTimerState();
            }
        }, 300);
    }

    function updatePlantMood(completionRate) {
        const calendarTrigger = document.getElementById('calendarTrigger');
        if (!calendarTrigger) return;

        const img = calendarTrigger.querySelector('img');
        if (!img) return;

        if (completionRate >= 1) {
            img.style.filter = 'hue-rotate(120deg) saturate(1.3) brightness(1.2)';
            showMoodNotification('🌟 植物非常开心！');
        } else if (completionRate >= 0.7) {
            img.style.filter = 'hue-rotate(80deg) saturate(1.2) brightness(1.15)';
            showMoodNotification('😊 植物心情不错！');
        } else if (completionRate >= 0.4) {
            img.style.filter = 'hue-rotate(50deg) saturate(1.1) brightness(1.05)';
            showMoodNotification('😐 植物有点失落...');
        } else if (completionRate > 0) {
            img.style.filter = 'hue-rotate(0deg) saturate(0.8) brightness(0.9)';
            showMoodNotification('😢 植物很伤心...');
        }
    }

    function showMoodNotification(msg) {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = msg;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    let timerDragging = false;
    let timerDragOffsetX = 0;
    let timerDragOffsetY = 0;

    if (timer) {
        timer.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            timerDragging = true;
            const rect = timer.getBoundingClientRect();
            timerDragOffsetX = e.clientX - rect.left;
            timerDragOffsetY = e.clientY - rect.top;
            timer.style.position = 'fixed';
            timer.style.left = rect.left + 'px';
            timer.style.top = rect.top + 'px';
            timer.style.transform = 'none';
        });

        timer.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            timerDragging = true;
            const rect = timer.getBoundingClientRect();
            timerDragOffsetX = e.touches[0].clientX - rect.left;
            timerDragOffsetY = e.touches[0].clientY - rect.top;
            timer.style.position = 'fixed';
            timer.style.left = rect.left + 'px';
            timer.style.top = rect.top + 'px';
            timer.style.transform = 'none';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!timerDragging || !timer) return;
        const x = e.clientX - timerDragOffsetX;
        const y = e.clientY - timerDragOffsetY;
        timer.style.left = Math.max(0, Math.min(x, window.innerWidth - timer.offsetWidth)) + 'px';
        timer.style.top = Math.max(0, Math.min(y, window.innerHeight - timer.offsetHeight)) + 'px';
    });

    document.addEventListener('mouseup', () => {
        timerDragging = false;
    });

    document.addEventListener('touchmove', (e) => {
        if (!timerDragging || !timer) return;
        const x = e.touches[0].clientX - timerDragOffsetX;
        const y = e.touches[0].clientY - timerDragOffsetY;
        timer.style.left = Math.max(0, Math.min(x, window.innerWidth - timer.offsetWidth)) + 'px';
        timer.style.top = Math.max(0, Math.min(y, window.innerHeight - timer.offsetHeight)) + 'px';
    });

    document.addEventListener('touchend', () => {
        timerDragging = false;
    });
});