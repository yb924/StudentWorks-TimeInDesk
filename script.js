document.addEventListener('DOMContentLoaded', function() {
    const notebookTrigger = document.getElementById('notebookTrigger');
    const notebookOverlay = document.getElementById('notebookOverlay');
    const notebook = document.getElementById('notebook');
    const closeNotebook = document.getElementById('closeNotebook');
    const currentPageSpan = document.getElementById('currentPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const notebookEditor = document.getElementById('notebookEditor');
    const notebookImages = document.getElementById('notebookImages');
    const imageInput = document.getElementById('imageInput');
    const saveBtn = document.getElementById('saveBtn');

    if (!notebookTrigger || !notebookOverlay) return;

    let currentPage = 1;
    const totalPages = 5;
    const pages = JSON.parse(localStorage.getItem('notebookPages')) || {};
    const pagesImages = JSON.parse(localStorage.getItem('notebookPagesImages')) || {};

    function saveToStorage() {
        localStorage.setItem('notebookPages', JSON.stringify(pages));
        localStorage.setItem('notebookPagesImages', JSON.stringify(pagesImages));
    }

    function saveCurrentPage() {
        if (notebookEditor) pages[currentPage] = notebookEditor.innerHTML;
    }

    function loadPage(page) {
        saveCurrentPage();
        currentPage = page;
        if (notebookEditor) notebookEditor.innerHTML = pages[page] || '';
        if (currentPageSpan) currentPageSpan.textContent = currentPage;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
        loadPageImages(page);
        setTimeout(() => applyPenStyle(), 0); // 换页后应用当前笔的样式
    }

    function loadPageImages(page) {
        if (!notebookImages) return;
        notebookImages.innerHTML = '';
        const images = pagesImages[page] || [];
        images.forEach((imgData, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'notebook-image-container';
            
            const img = document.createElement('img');
            img.src = imgData;
            img.className = 'notebook-image';
            imgContainer.appendChild(img);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-image-btn';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                deleteImage(page, index);
            });
            imgContainer.appendChild(deleteBtn);
            
            notebookImages.appendChild(imgContainer);
        });
    }

    function deleteImage(page, index) {
        if (!pagesImages[page]) return;
        pagesImages[page].splice(index, 1);
        saveToStorage();
        loadPageImages(page);
        showSaveNotification();
    }

    function addImage(file) {
        if (!file || !file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgData = e.target.result;
            if (!pagesImages[currentPage]) {
                pagesImages[currentPage] = [];
            }
            pagesImages[currentPage].push(imgData);
            saveToStorage();
            loadPageImages(currentPage);
            showSaveNotification();
        };
        reader.readAsDataURL(file);
    }

    function openNotebook() {
        notebookOverlay.classList.add('active');
        loadPage(1);
        applyPenStyle();
        if (notebookEditor) notebookEditor.focus();
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

    // 点击编辑器时应用当前笔的样式
    if (notebookEditor) {
        notebookEditor.addEventListener('click', () => {
            applyPenStyle();
        });
        
        notebookEditor.addEventListener('focus', () => {
            applyPenStyle();
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

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                addImage(file);
                imageInput.value = '';
            }
        });
    }

    // 笔筒功能
    const penHolderTrigger = document.getElementById('penHolderTrigger');
    const penHolderOverlay = document.getElementById('penHolderOverlay');
    const penHolder = document.getElementById('penHolder');
    const closePenHolder = document.getElementById('closePenHolder');
    const penList = document.getElementById('penList');
    const currentPenIndicator = document.getElementById('currentPenIndicator');
    const penPreview = document.getElementById('penPreview');
    const penLabel = document.getElementById('penLabel');

    let currentPen = {
        name: '黑色钢笔',
        color: '#333',
        font: 'serif',
        pen: 'fountain-black',
        size: 3, // 1-7
        intensity: 1 // 0.3-1
    };

    // 从localStorage加载保存的笔
    const savedPen = localStorage.getItem('currentPen');
    if (savedPen) {
        const saved = JSON.parse(savedPen);
        currentPen = { ...currentPen, ...saved };
        updatePenIndicator();
        applyPenStyle();
    }

    function updatePenIndicator() {
        if (penPreview) penPreview.style.background = currentPen.color;
        if (penLabel) penLabel.textContent = currentPen.name;
    }

    function applyPenStyle() {
        if (!notebookEditor) return;
        
        // 设置字体大小 - 使用CSS变量来确保一致性
        const sizeMap = {
            1: '12px',
            2: '14px',
            3: '16px',
            4: '18px',
            5: '22px',
            6: '26px',
            7: '30px'
        };
        const fontSize = sizeMap[currentPen.size] || '16px';
        notebookEditor.style.fontSize = fontSize;
        
        // 设置文字颜色（应用深浅度）
        const adjustedColor = adjustColorIntensity(currentPen.color, currentPen.intensity);
        document.execCommand('foreColor', false, adjustedColor);
        
        // 设置字体
        let fontName = 'Georgia';
        if (currentPen.font === 'serif') {
            fontName = 'Georgia';
        } else if (currentPen.font === 'sans-serif') {
            fontName = 'Arial';
        } else if (currentPen.font === 'cursive') {
            fontName = 'cursive';
        } else if (currentPen.font === 'monospace') {
            fontName = 'Courier New';
        }
        notebookEditor.style.fontFamily = fontName;
        
        // 设置粗体
        if (currentPen.pen.includes('brush') || currentPen.pen.includes('marker')) {
            notebookEditor.style.fontWeight = 'bold';
        } else {
            notebookEditor.style.fontWeight = 'normal';
        }
    }

    // 监听输入事件，确保样式正确应用
    if (notebookEditor) {
        notebookEditor.addEventListener('focus', () => {
            applyPenStyle();
        });
        
        notebookEditor.addEventListener('click', () => {
            applyPenStyle();
        });
    }

    function adjustColorIntensity(hexColor, intensity) {
        // 将十六进制颜色转换为RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // 使用更强的指数曲线增强效果
        // 当intensity较低时，颜色会显著变浅；较高时保持原色
        const factor = Math.pow(intensity, 0.4);
        
        // 增强效果：当intensity=0.3时，颜色会明显变浅（约85%白色混合）
        const blendRatio = 1 - factor;
        const newR = Math.round(r * factor + 255 * blendRatio);
        const newG = Math.round(g * factor + 255 * blendRatio);
        const newB = Math.round(b * factor + 255 * blendRatio);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    function selectPen(penItem) {
        const pen = penItem.dataset.pen;
        const color = penItem.dataset.color;
        const font = penItem.dataset.font;
        const name = penItem.querySelector('.pen-name').textContent;

        // 保留当前的大小和深浅设置
        currentPen = { 
            name, 
            color, 
            font, 
            pen,
            size: currentPen.size || 3,
            intensity: currentPen.intensity || 1
        };
        localStorage.setItem('currentPen', JSON.stringify(currentPen));
        
        updatePenIndicator();
        applyPenStyle();
        
        // 更新选中状态
        document.querySelectorAll('.pen-item').forEach(item => item.classList.remove('selected'));
        penItem.classList.add('selected');
        
        // 关闭笔筒弹窗
        penHolderOverlay.classList.remove('active');
        
        showSaveNotification('已选择: ' + name);
    }

    if (penHolderTrigger) {
        penHolderTrigger.addEventListener('click', () => {
            penHolderOverlay.classList.add('active');
            // 标记当前选中的笔
            document.querySelectorAll('.pen-item').forEach(item => {
                if (item.dataset.pen === currentPen.pen) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        });
    }

    if (closePenHolder) {
        closePenHolder.addEventListener('click', () => {
            penHolderOverlay.classList.remove('active');
        });
    }

    if (penHolderOverlay) {
        penHolderOverlay.addEventListener('click', (e) => {
            if (e.target === penHolderOverlay) {
                penHolderOverlay.classList.remove('active');
            }
        });
    }

    if (penList) {
        penList.addEventListener('click', (e) => {
            const penItem = e.target.closest('.pen-item');
            if (penItem) {
                selectPen(penItem);
            }
        });
    }

    // 点击笔记本中的笔指示器也可以打开笔筒
    if (currentPenIndicator) {
        currentPenIndicator.addEventListener('click', () => {
            penHolderOverlay.classList.add('active');
            document.querySelectorAll('.pen-item').forEach(item => {
                if (item.dataset.pen === currentPen.pen) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        });
    }

    // 笔设置菜单功能
    const penSettingsMenu = document.getElementById('penSettingsMenu');
    const penSizeSlider = document.getElementById('penSizeSlider');
    const penSizeValue = document.getElementById('penSizeValue');
    const colorIntensitySlider = document.getElementById('colorIntensitySlider');
    const colorIntensityValue = document.getElementById('colorIntensityValue');
    const applyPenSettings = document.getElementById('applyPenSettings');

    let rightClickedPen = null;

    // 钢笔右键菜单
    if (penList) {
        penList.addEventListener('contextmenu', (e) => {
            const penItem = e.target.closest('.pen-item');
            if (penItem) {
                e.preventDefault();
                rightClickedPen = penItem;
                
                // 填充当前设置值
                penSizeSlider.value = currentPen.size;
                updatePenSizeDisplay(currentPen.size);
                colorIntensitySlider.value = currentPen.intensity;
                updateColorIntensityDisplay(currentPen.intensity);
                
                // 显示菜单
                penSettingsMenu.style.display = 'block';
            }
        });
    }

    // 更新笔大小显示
    function updatePenSizeDisplay(value) {
        const sizeLabels = ['极小', '很小', '小', '中等', '大', '很大', '极大'];
        const index = parseInt(value) - 1;
        penSizeValue.textContent = sizeLabels[index] || '中等';
    }

    // 更新颜色深浅显示
    function updateColorIntensityDisplay(value) {
        const numValue = parseFloat(value);
        if (numValue >= 0.9) {
            colorIntensityValue.textContent = '最深';
        } else if (numValue >= 0.7) {
            colorIntensityValue.textContent = '深';
        } else if (numValue >= 0.5) {
            colorIntensityValue.textContent = '中等';
        } else if (numValue >= 0.35) {
            colorIntensityValue.textContent = '浅';
        } else {
            colorIntensityValue.textContent = '很浅';
        }
    }

    // 笔大小滑块事件
    if (penSizeSlider) {
        penSizeSlider.addEventListener('input', (e) => {
            updatePenSizeDisplay(e.target.value);
        });
    }

    // 颜色深浅滑块事件
    if (colorIntensitySlider) {
        colorIntensitySlider.addEventListener('input', (e) => {
            updateColorIntensityDisplay(e.target.value);
        });
    }

    // 应用设置按钮
    if (applyPenSettings) {
        applyPenSettings.addEventListener('click', () => {
            if (rightClickedPen) {
                const pen = rightClickedPen.dataset.pen;
                const color = rightClickedPen.dataset.color;
                const font = rightClickedPen.dataset.font;
                const name = rightClickedPen.querySelector('.pen-name').textContent;
                const size = parseInt(penSizeSlider.value);
                const intensity = parseFloat(colorIntensitySlider.value);

                currentPen = { name, color, font, pen, size, intensity };
                localStorage.setItem('currentPen', JSON.stringify(currentPen));
                
                updatePenIndicator();
                applyPenStyle();
                
                // 更新选中状态
                document.querySelectorAll('.pen-item').forEach(item => item.classList.remove('selected'));
                rightClickedPen.classList.add('selected');
                
                // 关闭设置菜单和笔筒
                penSettingsMenu.style.display = 'none';
                penHolderOverlay.classList.remove('active');
                
                showSaveNotification('已应用笔设置');
            }
        });
    }

    // 点击外部关闭设置菜单
    document.addEventListener('click', (e) => {
        if (!penSettingsMenu.contains(e.target)) {
            penSettingsMenu.style.display = 'none';
        }
    });

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
    let completedSchedules = {};

    try {
        schedules = JSON.parse(localStorage.getItem('calendarSchedules')) || {};
    } catch (e) {
        schedules = {};
    }

    try {
        completedSchedules = JSON.parse(localStorage.getItem('completedSchedules')) || {};
    } catch (e) {
        completedSchedules = {};
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
            
            const dayNumber = document.createElement('span');
            dayNumber.textContent = i;
            day.appendChild(dayNumber);

            const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
            if (dateStr === todayStr) {
                day.classList.add('today');
            }
            if (selectedDate === dateStr) {
                day.classList.add('selected');
            }
            if (schedules.hasOwnProperty(dateStr) && schedules[dateStr]) {
                day.classList.add('has-schedule');
                if (completedSchedules[dateStr]) {
                    day.classList.add('completed');
                    const checkMark = document.createElement('span');
                    checkMark.className = 'check-mark';
                    checkMark.textContent = '✓';
                    day.appendChild(checkMark);
                }
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
        
        const scheduleCompleteCheckbox = document.getElementById('scheduleComplete');
        if (scheduleCompleteCheckbox) {
            scheduleCompleteCheckbox.checked = completedSchedules[dateStr] || false;
        }
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
        
        const scheduleCompleteCheckbox = document.getElementById('scheduleComplete');
        if (scheduleCompleteCheckbox && scheduleCompleteCheckbox.checked) {
            completedSchedules[selectedDate] = true;
        } else {
            completedSchedules[selectedDate] = false;
        }
        
        localStorage.setItem('calendarSchedules', JSON.stringify(schedules));
        localStorage.setItem('completedSchedules', JSON.stringify(completedSchedules));
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