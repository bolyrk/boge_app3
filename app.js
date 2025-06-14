// Data structure for storing categories and channels
let appData = {
    categories: [],
    channels: [],
    currentCategoryId: 'all',
    searchQuery: '',
    isSearching: false
};

// DOM elements
const elements = {
    categoryList: document.getElementById('categoryList'),
    channelGrid: document.getElementById('channelGrid'),
    currentCategoryName: document.getElementById('currentCategoryName'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    addChannelBtn: document.getElementById('addChannelBtn'),
    categoryModal: document.getElementById('categoryModal'),
    channelModal: document.getElementById('channelModal'),
    confirmDialog: document.getElementById('confirmDialog'),
    categoryForm: document.getElementById('categoryForm'),
    channelForm: document.getElementById('channelForm'),
    categoryContextMenu: document.getElementById('categoryContextMenu'),
    channelContextMenu: document.getElementById('channelContextMenu'),
    closeModalBtns: document.querySelectorAll('.close-modal, .close-btn'),
    confirmYes: document.getElementById('confirmYes'),
    confirmNo: document.getElementById('confirmNo'),
    confirmMessage: document.getElementById('confirmMessage'),
    categoryModalTitle: document.getElementById('categoryModalTitle'),
    channelModalTitle: document.getElementById('channelModalTitle'),
    categoryNameInput: document.getElementById('categoryName'),
    categoryIdInput: document.getElementById('categoryId'),
    channelUrlInput: document.getElementById('channelUrl'),
    channelNameInput: document.getElementById('channelName'),
    channelSubscribersInput: document.getElementById('channelSubscribers'),
    channelCategorySelect: document.getElementById('channelCategory'),
    channelTagsInput: document.getElementById('channelTags'),
    channelIdInput: document.getElementById('channelId'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    importDataBtn: document.getElementById('importDataBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    importModal: document.getElementById('importModal'),
    exportModal: document.getElementById('exportModal'),
    importBtn: document.getElementById('importBtn'),
    jsonInput: document.getElementById('jsonInput'),
    importMode: document.getElementById('importMode'),
    exportJsonData: document.getElementById('exportJsonData'),
    copyJsonBtn: document.getElementById('copyJsonBtn'),
    downloadJsonBtn: document.getElementById('downloadJsonBtn'),
    notification: document.getElementById('notification'),
    notificationMessage: document.getElementById('notificationMessage'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn')
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    renderCategories();
    renderChannels();
});

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('youtubeChannelManager');
    if (savedData) {
        try {
            appData = JSON.parse(savedData);
        } catch (error) {
            console.error('加载数据失败:', error);
            // Initialize with default data if loading fails
            initializeDefaultData();
        }
    } else {
        // No saved data, initialize with defaults
        initializeDefaultData();
    }
    
    // 初始化搜索状态
    appData.searchQuery = '';
    appData.isSearching = false;
}

// Initialize with default categories
function initializeDefaultData() {
    appData = {
        categories: [
            { id: 'programming', name: '编程', order: 1 }
        ],
        channels: [],
        currentCategoryId: 'all'
    };
    saveData();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('youtubeChannelManager', JSON.stringify(appData));
}

// Setup event listeners for user interactions
function setupEventListeners() {
    // Add category button
    elements.addCategoryBtn.addEventListener('click', () => {
        openCategoryModal();
    });

    // Add channel button
    elements.addChannelBtn.addEventListener('click', () => {
        openChannelModal();
    });

    // Clear data button
    elements.clearDataBtn.addEventListener('click', () => {
        confirmClearData();
    });

    // Import data button
    elements.importDataBtn.addEventListener('click', () => {
        openImportModal();
    });
    
    // Export data button
    elements.exportDataBtn.addEventListener('click', () => {
        openExportModal();
    });

    // 搜索按钮和输入框事件
    elements.searchBtn.addEventListener('click', () => {
        performSearch();
    });
    
    elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        } else if (elements.searchInput.value.trim() === '' && appData.isSearching) {
            // 当搜索框清空时恢复正常显示
            clearSearch();
        }
    });

    // Close modal buttons
    elements.closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Category form submission
    elements.categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCategory();
    });

    // Channel form submission
    elements.channelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveChannel();
    });

    // Confirm dialog buttons
    elements.confirmYes.addEventListener('click', () => {
        if (elements.confirmDialog.dataset.action === 'deleteCategory') {
            deleteCategory(elements.confirmDialog.dataset.id);
        } else if (elements.confirmDialog.dataset.action === 'deleteChannel') {
            deleteChannel(elements.confirmDialog.dataset.id);
        } else if (elements.confirmDialog.dataset.action === 'clearData') {
            clearAllData();
        }
        closeAllModals();
    });

    elements.confirmNo.addEventListener('click', closeAllModals);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.categoryModal || e.target === elements.channelModal || 
            e.target === elements.confirmDialog || e.target === elements.importModal || 
            e.target === elements.exportModal) {
            closeAllModals();
        }
    });

    // Close context menus when clicking elsewhere
    document.addEventListener('click', () => {
        elements.categoryContextMenu.style.display = 'none';
        elements.channelContextMenu.style.display = 'none';
    });

    // Prevent context menu from closing when clicking inside
    elements.categoryContextMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    elements.channelContextMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Import button
    elements.importBtn.addEventListener('click', () => {
        importData();
    });
    
    // Export copy button
    elements.copyJsonBtn.addEventListener('click', () => {
        copyExportedData();
    });
    
    // Export download button
    elements.downloadJsonBtn.addEventListener('click', () => {
        downloadExportedData();
    });
}

// Render categories in the sidebar
function renderCategories() {
    // Sort categories by order
    const sortedCategories = [...appData.categories].sort((a, b) => a.order - b.order);
    
    // Create a fragment to improve performance
    const fragment = document.createDocumentFragment();
    
    // Add "All Channels" option
    const allItem = document.createElement('div');
    allItem.className = `category-item${appData.currentCategoryId === 'all' ? ' active' : ''}`;
    allItem.dataset.id = 'all';
    allItem.innerHTML = `
        <span class="category-name">全部频道</span>
        <span class="category-count">${appData.channels.length}</span>
    `;
    allItem.addEventListener('click', () => selectCategory('all'));
    allItem.addEventListener('contextmenu', (e) => showCategoryContextMenu(e, 'all'));
    fragment.appendChild(allItem);
    
    // Add each category
    sortedCategories.forEach(category => {
        const channelCount = appData.channels.filter(ch => ch.categoryId === category.id).length;
        
        const item = document.createElement('div');
        item.className = `category-item${category.id === appData.currentCategoryId ? ' active' : ''}`;
        item.dataset.id = category.id;
        item.innerHTML = `
            <span class="category-name">${category.name}</span>
            <span class="category-count">${channelCount}</span>
        `;
        
        // Add event listeners
        item.addEventListener('click', () => selectCategory(category.id));
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showCategoryContextMenu(e, category.id);
        });
        
        fragment.appendChild(item);
    });
    
    // Clear and append the categories
    elements.categoryList.innerHTML = '';
    elements.categoryList.appendChild(fragment);
}

// Render channels in the main content area
function renderChannels() {
    // 如果正在搜索，不要干扰搜索结果
    if (appData.isSearching) {
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    // Filter channels based on current category
    let filteredChannels = appData.channels;
    if (appData.currentCategoryId !== 'all') {
        filteredChannels = appData.channels.filter(channel => channel.categoryId === appData.currentCategoryId);
    }
    
    // Sort channels by subscriber count (high to low)
    filteredChannels.sort((a, b) => {
        // Handle undefined or null subscriber counts
        const countA = a.subscriberCount || 0;
        const countB = b.subscriberCount || 0;
        return countB - countA; // Sort from high to low
    });
    
    // Update the category name header
    if (appData.currentCategoryId === 'all') {
        elements.currentCategoryName.textContent = '全部频道';
        
        // 在"全部频道"视图中，计算每个分类中前5名频道
        const rankedChannels = calculateTopChannelsPerCategory();
        
        // 标记分类中的前5名频道
        filteredChannels = filteredChannels.map(channel => {
            const rankInfo = rankedChannels.find(rc => rc.channelId === channel.id);
            if (rankInfo) {
                return { ...channel, rank: rankInfo.rank, categoryRank: true };
            }
            return channel;
        });
    } else {
        const category = appData.categories.find(cat => cat.id === appData.currentCategoryId);
        elements.currentCategoryName.textContent = category ? category.name : '未知分类';
        
        // 为当前分类的前5名频道添加排名
        filteredChannels = filteredChannels.map((channel, index) => {
            return index < 5 ? { ...channel, rank: index + 1 } : channel;
        });
    }
    
    // If no channels, show empty state
    if (filteredChannels.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-folder-open"></i>
            <h3>没有找到频道</h3>
            <p>添加一些频道开始使用</p>
        `;
        fragment.appendChild(emptyState);
    } else {
        // Add each channel card
        filteredChannels.forEach(channel => {
            const card = createChannelCard(channel);
            fragment.appendChild(card);
        });
    }
    
    // Clear and append the channels
    elements.channelGrid.innerHTML = '';
    elements.channelGrid.appendChild(fragment);
}

// 计算每个分类中排名前5的频道
function calculateTopChannelsPerCategory() {
    const rankedChannels = [];
    
    // 处理每个分类
    appData.categories.forEach(category => {
        // 获取该分类的所有频道
        const categoryChannels = appData.channels.filter(channel => channel.categoryId === category.id);
        
        // 按订阅数排序
        categoryChannels.sort((a, b) => {
            const countA = a.subscriberCount || 0;
            const countB = b.subscriberCount || 0;
            return countB - countA;
        });
        
        // 取前5名并添加到结果数组
        categoryChannels.slice(0, 5).forEach((channel, index) => {
            rankedChannels.push({
                channelId: channel.id,
                categoryId: category.id,
                categoryName: category.name,
                rank: index + 1
            });
        });
    });
    
    return rankedChannels;
}

// Create a channel card element
function createChannelCard(channel) {
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.dataset.id = channel.id;
    
    // Format subscriber count
    const formattedSubscribers = formatSubscriberCount(channel.subscriberCount);
    
    // Create tags HTML
    let tagsHtml = '';
    if (channel.customTags && channel.customTags.length > 0) {
        tagsHtml = '<div class="channel-tags">';
        channel.customTags.forEach(tag => {
            tagsHtml += `<span class="channel-tag">${tag}</span>`;
        });
        tagsHtml += '</div>';
    }
    
    card.innerHTML = `
        <div class="channel-avatar">
            <img src="${channel.thumbnailUrl || 'https://via.placeholder.com/64'}" alt="${channel.name}">
            <div class="orbit-effect"></div>
        </div>
        <div class="channel-info">
            <h3 class="channel-name">${channel.name}</h3>
            <div class="channel-subscribers">${formattedSubscribers} 位订阅者</div>
            ${tagsHtml}
        </div>
        <div class="channel-actions">
            <button class="btn-visit" onclick="window.open('${channel.url}', '_blank')">
                <i class="fas fa-external-link-alt"></i> 访问频道
            </button>
        </div>
    `;
    
    // Add context menu event
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showChannelContextMenu(e, channel.id);
    });
    
    // 添加光圈效果
    createOrbitEffect(card.querySelector('.orbit-effect'));
    
    return card;
}

// 创建光圈旋转效果
function createOrbitEffect(container) {
    // 优化：设置动画只在可视范围内触发
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 如果元素在视窗内，创建动画
                    initOrbitAnimation(container);
                    // 一旦创建了动画，停止观察
                    observer.unobserve(container);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(container.closest('.channel-card'));
    } else {
        // 回退方案：对于不支持IntersectionObserver的浏览器
        initOrbitAnimation(container);
    }
}

// 初始化轨道动画效果
function initOrbitAnimation(container) {
    // 检查是否已经初始化过
    if (container.dataset.initialized === 'true') {
        return;
    }
    
    // 标记为已初始化
    container.dataset.initialized = 'true';
    
    // 清空容器，避免重复添加
    container.innerHTML = '';
    
    // 根据设备性能调整粒子数量
    const particleCount = window.matchMedia('(max-width: 768px)').matches ? 3 : 5;
    
    // 添加多个轨道粒子，形成不同方向的旋转
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'orbit-particle';
        
        // 设置随机大小
        const size = 8 + Math.random() * 6;
        
        // 设置不同样式和动画
        const style = {
            animationName: i % 2 === 0 ? 'orbit' : 'orbit-reverse',
            animationDuration: `${2.5 + i * 0.7 + Math.random()}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${i * 0.2}s`,
            top: '50%',
            left: '50%',
            width: `${size}px`,
            height: `${size}px`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.7 - (i * 0.1),
            // 优化：添加硬件加速
            willChange: 'transform',
            backfaceVisibility: 'hidden'
        };
        
        // 应用样式
        Object.assign(particle.style, style);
        container.appendChild(particle);
    }
    
    // 添加一个脉动的中心光点
    const centerGlow = document.createElement('div');
    centerGlow.className = 'orbit-particle';
    const centerStyle = {
        width: '10px',
        height: '10px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animationName: 'pulse',
        animationDuration: '2s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 1) 30%, rgba(56, 189, 248, 0.5) 70%)',
        // 优化：添加硬件加速
        willChange: 'transform',
        backfaceVisibility: 'hidden'
    };
    Object.assign(centerGlow.style, centerStyle);
    container.appendChild(centerGlow);
    
    // 性能优化：根据设备性能决定是否添加额外的粒子
    if (!window.matchMedia('(max-width: 768px)').matches) {
        // 添加额外的轨道光点，具有不同的轨道大小
        for (let i = 0; i < 2; i++) {
            const extraParticle = document.createElement('div');
            extraParticle.className = 'orbit-particle';
            
            const translateDistance = 35 + (i * 15);
            const size = 5 + Math.random() * 4;
            
            const extraStyle = {
                width: `${size}px`,
                height: `${size}px`,
                opacity: 0.6,
                top: '50%',
                left: '50%',
                animationName: i % 2 === 0 ? 'orbit-reverse' : 'orbit',
                animationDuration: `${4 - i * 0.5}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.5}s`,
                transform: `rotate(${i * 90}deg) translateX(${translateDistance}px) rotate(-${i * 90}deg)`,
                // 优化：添加硬件加速
                willChange: 'transform',
                backfaceVisibility: 'hidden'
            };
            
            Object.assign(extraParticle.style, extraStyle);
            container.appendChild(extraParticle);
        }
    }
}

// Format subscriber count (e.g., 1200000 -> 1.2百万)
function formatSubscriberCount(count) {
    if (!count && count !== 0) return '未知';
    
    if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + '千';
    } else {
        return count.toString();
    }
}

// Select a category
function selectCategory(categoryId) {
    appData.currentCategoryId = categoryId;
    saveData();
    renderCategories();
    renderChannels();
}

// Show category context menu
function showCategoryContextMenu(e, categoryId) {
    e.preventDefault();
    
    // Don't show edit/delete options for "All Channels"
    if (categoryId === 'all') {
        return;
    }
    
    // Position the context menu
    const menu = elements.categoryContextMenu;
    menu.style.display = 'block';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    
    // Set up click handlers for menu items
    const editItem = menu.querySelector('[data-action="edit"]');
    const deleteItem = menu.querySelector('[data-action="delete"]');
    
    editItem.onclick = () => {
        editCategory(categoryId);
        menu.style.display = 'none';
    };
    
    deleteItem.onclick = () => {
        confirmDeleteCategory(categoryId);
        menu.style.display = 'none';
    };
}

// Show channel context menu
function showChannelContextMenu(e, channelId) {
    e.preventDefault();
    
    // Position the context menu
    const menu = elements.channelContextMenu;
    menu.style.display = 'block';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    
    // Set up click handlers for menu items
    const editItem = menu.querySelector('[data-action="edit"]');
    const moveItem = menu.querySelector('[data-action="move"]');
    const deleteItem = menu.querySelector('[data-action="delete"]');
    
    editItem.onclick = () => {
        editChannel(channelId);
        menu.style.display = 'none';
    };
    
    moveItem.onclick = () => {
        // To be implemented - Move to category submenu
        menu.style.display = 'none';
    };
    
    deleteItem.onclick = () => {
        confirmDeleteChannel(channelId);
        menu.style.display = 'none';
    };
}

// Open category modal for creating a new category
function openCategoryModal(categoryId = null) {
    const isEdit = categoryId !== null;
    
    elements.categoryModalTitle.textContent = isEdit ? '编辑分类' : '添加分类';
    elements.categoryNameInput.value = '';
    elements.categoryIdInput.value = '';
    
    if (isEdit) {
        const category = appData.categories.find(cat => cat.id === categoryId);
        if (category) {
            elements.categoryNameInput.value = category.name;
            elements.categoryIdInput.value = category.id;
        }
    }
    
    elements.categoryModal.style.display = 'block';
}

// Open channel modal for creating a new channel
function openChannelModal(channelId = null) {
    const isEdit = channelId !== null;
    
    elements.channelModalTitle.textContent = isEdit ? '编辑频道' : '添加频道';
    elements.channelUrlInput.value = '';
    elements.channelNameInput.value = '';
    elements.channelSubscribersInput.value = '';
    elements.channelTagsInput.value = '';
    elements.channelIdInput.value = '';
    
    // Populate category dropdown
    elements.channelCategorySelect.innerHTML = '';
    appData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.channelCategorySelect.appendChild(option);
    });
    
    if (isEdit) {
        const channel = appData.channels.find(ch => ch.id === channelId);
        if (channel) {
            elements.channelUrlInput.value = channel.url;
            elements.channelNameInput.value = channel.name;
            elements.channelSubscribersInput.value = channel.subscriberCount || '';
            elements.channelCategorySelect.value = channel.categoryId;
            elements.channelTagsInput.value = channel.customTags ? channel.customTags.join(', ') : '';
            elements.channelIdInput.value = channel.id;
        }
    } else {
        // Set current category as default when adding new channel
        if (appData.currentCategoryId !== 'all') {
            elements.channelCategorySelect.value = appData.currentCategoryId;
        }
    }
    
    elements.channelModal.style.display = 'block';
}

// Edit an existing category
function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

// Edit an existing channel
function editChannel(channelId) {
    openChannelModal(channelId);
}

// Save category from form
function saveCategory() {
    const categoryName = elements.categoryNameInput.value.trim();
    const categoryId = elements.categoryIdInput.value;
    
    if (categoryName === '') {
        alert('请输入分类名称');
        return;
    }
    
    if (categoryId) {
        // Update existing category
        const categoryIndex = appData.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex !== -1) {
            appData.categories[categoryIndex].name = categoryName;
        }
    } else {
        // Add new category
        const newCategory = {
            id: 'category_' + Date.now(),
            name: categoryName,
            order: appData.categories.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        appData.categories.push(newCategory);
    }
    
    saveData();
    renderCategories();
    closeAllModals();
}

// Save channel from form
function saveChannel() {
    const channelUrl = elements.channelUrlInput.value.trim();
    const channelName = elements.channelNameInput.value.trim();
    const subscriberCount = elements.channelSubscribersInput.value ? parseInt(elements.channelSubscribersInput.value, 10) : null;
    const categoryId = elements.channelCategorySelect.value;
    const tagInput = elements.channelTagsInput.value.trim();
    const channelId = elements.channelIdInput.value;
    
    if (channelUrl === '') {
        alert('请输入频道链接');
        return;
    }
    
    if (channelName === '') {
        alert('请输入频道名称');
        return;
    }
    
    // Parse tags
    const customTags = tagInput ? tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
    
    if (channelId) {
        // Update existing channel
        const channelIndex = appData.channels.findIndex(ch => ch.id === channelId);
        if (channelIndex !== -1) {
            appData.channels[channelIndex].url = channelUrl;
            appData.channels[channelIndex].name = channelName;
            appData.channels[channelIndex].subscriberCount = subscriberCount;
            appData.channels[channelIndex].categoryId = categoryId;
            appData.channels[channelIndex].customTags = customTags;
            appData.channels[channelIndex].updatedAt = new Date().toISOString();
            
            // In a real app, we would fetch updated channel info from YouTube API here
        }
    } else {
        // Add new channel - simulate fetching channel info
        fetchYouTubeChannelInfo(channelUrl, channelName, subscriberCount)
            .then(channelInfo => {
                const newChannel = {
                    id: 'channel_' + Date.now(),
                    youtubeId: channelInfo.youtubeId,
                    name: channelInfo.name,
                    subscriberCount: channelInfo.subscriberCount,
                    thumbnailUrl: channelInfo.thumbnailUrl,
                    description: channelInfo.description,
                    categoryId: categoryId,
                    customTags: customTags,
                    url: channelUrl,
                    lastUpdated: new Date().toISOString(),
                    addedAt: new Date().toISOString()
                };
                appData.channels.push(newChannel);
                
                saveData();
                renderCategories();
                renderChannels();
            })
            .catch(error => {
                console.error('添加频道时出错:', error);
                alert('添加频道失败。请检查链接并重试。');
            });
    }
    
    saveData();
    renderCategories();
    renderChannels();
    closeAllModals();
}

// Confirm category deletion
function confirmDeleteCategory(categoryId) {
    const category = appData.categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const channelCount = appData.channels.filter(ch => ch.categoryId === categoryId).length;
    elements.confirmMessage.textContent = `确定要删除"${category.name}"分类吗？这将会从该分类中移除 ${channelCount} 个频道。`;
    elements.confirmDialog.dataset.action = 'deleteCategory';
    elements.confirmDialog.dataset.id = categoryId;
    elements.confirmDialog.style.display = 'block';
}

// Confirm channel deletion
function confirmDeleteChannel(channelId) {
    const channel = appData.channels.find(ch => ch.id === channelId);
    if (!channel) return;
    
    elements.confirmMessage.textContent = `确定要从收藏中移除"${channel.name}"吗？`;
    elements.confirmDialog.dataset.action = 'deleteChannel';
    elements.confirmDialog.dataset.id = channelId;
    elements.confirmDialog.style.display = 'block';
}

// Delete a category
function deleteCategory(categoryId) {
    // Remove the category
    appData.categories = appData.categories.filter(cat => cat.id !== categoryId);
    
    // Reset any channel in this category to "uncategorized"
    appData.channels.forEach(channel => {
        if (channel.categoryId === categoryId) {
            channel.categoryId = 'uncategorized';
        }
    });
    
    // If we're currently viewing this category, switch to "all"
    if (appData.currentCategoryId === categoryId) {
        appData.currentCategoryId = 'all';
    }
    
    saveData();
    renderCategories();
    renderChannels();
}

// Delete a channel
function deleteChannel(channelId) {
    appData.channels = appData.channels.filter(ch => ch.id !== channelId);
    saveData();
    renderCategories();
    renderChannels();
}

// Close all modals
function closeAllModals() {
    elements.categoryModal.style.display = 'none';
    elements.channelModal.style.display = 'none';
    elements.confirmDialog.style.display = 'none';
    elements.categoryContextMenu.style.display = 'none';
    elements.channelContextMenu.style.display = 'none';
    elements.importModal.style.display = 'none';
    elements.exportModal.style.display = 'none';
}

// Simulate YouTube API fetch
async function fetchYouTubeChannelInfo(url, name, subscriberCount = null) {
    // In a real app, this would call the YouTube Data API v3
    // For this demo, we'll simulate a response
    
    // Extract channel ID from URL (simplified)
    const youtubeId = url.includes('/channel/') 
        ? url.split('/channel/')[1].split('/')[0]
        : 'UC' + Math.random().toString(36).substring(2, 10);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock channel data
    return {
        youtubeId: youtubeId,
        name: name || 'YouTube频道 ' + youtubeId.substring(0, 6),
        subscriberCount: subscriberCount || Math.floor(Math.random() * 10000000),
        thumbnailUrl: `https://picsum.photos/seed/${youtubeId}/64/64`,
        description: '这是一个示例YouTube频道描述。',
    };
}

// Function to extract YouTube channel ID from URL (to be implemented)
function extractYoutubeChannelId(url) {
    // This would extract the channel ID from various YouTube URL formats
    // For demo purposes, we'll return a simplified version
    if (url.includes('/channel/')) {
        return url.split('/channel/')[1].split('/')[0];
    }
    return null;
}

// Function to extract standardized YouTube channel URL pattern
function extractYoutubeChannelUrl(url) {
    if (!url) return null;
    
    // 处理不同格式的YouTube链接
    if (url.includes('/channel/')) {
        // 标准频道链接 https://www.youtube.com/channel/UC...
        return url.split('/channel/')[1].split('/')[0];
    } else if (url.includes('/c/')) {
        // 自定义URL https://www.youtube.com/c/ChannelName
        return url.split('/c/')[1].split('/')[0].toLowerCase();
    } else if (url.includes('/user/')) {
        // 旧版用户URL https://www.youtube.com/user/UserName
        return url.split('/user/')[1].split('/')[0].toLowerCase();
    } else if (url.includes('/@')) {
        // 新版用户名URL https://www.youtube.com/@UserName
        return url.split('/@')[1].split('/')[0].toLowerCase();
    }
    
    return null;
}

// Function to ensure a category exists, return a valid category ID
function ensureCategoryExists(categoryId) {
    if (!categoryId) return 'uncategorized';
    
    // 检查分类是否存在
    const categoryExists = appData.categories.some(c => c.id === categoryId);
    
    if (categoryExists) {
        return categoryId;
    } else {
        // 如果分类不存在，返回默认分类
        // 如果有编程分类则优先使用
        const programmingCategory = appData.categories.find(c => c.id === 'programming');
        if (programmingCategory) {
            return 'programming';
        }
        
        // 否则使用第一个可用分类
        if (appData.categories.length > 0) {
            return appData.categories[0].id;
        }
        
        // 如果没有任何分类，创建一个默认分类
        const defaultCategory = {
            id: 'uncategorized',
            name: '未分类',
            order: 999,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        appData.categories.push(defaultCategory);
        return 'uncategorized';
    }
}

// Confirm data clearing
function confirmClearData() {
    elements.confirmMessage.textContent = '确定要清除所有分类和频道数据吗？此操作无法撤销。';
    elements.confirmDialog.dataset.action = 'clearData';
    elements.confirmDialog.style.display = 'block';
}

// Clear all data
function clearAllData() {
    // 清除本地存储数据
    localStorage.removeItem('youtubeChannelManager');
    
    // 重置应用数据
    initializeDefaultData();
    
    // 刷新界面
    renderCategories();
    renderChannels();
}

// Open import modal
function openImportModal() {
    elements.importModal.style.display = 'block';
}

// Open export modal
function openExportModal() {
    // 准备导出数据
    prepareExportData();
    elements.exportModal.style.display = 'block';
}

// 准备导出数据
function prepareExportData() {
    // 创建一个副本，避免直接修改应用数据
    const exportData = {
        categories: [...appData.categories],
        channels: [...appData.channels]
    };
    
    // 格式化JSON字符串，使其更易读
    const formattedJson = JSON.stringify(exportData, null, 2);
    elements.exportJsonData.value = formattedJson;
}

// 复制导出的数据到剪贴板
function copyExportedData() {
    const jsonText = elements.exportJsonData;
    jsonText.select();
    document.execCommand('copy');
    
    // 显示成功通知
    showNotification('数据已复制到剪贴板', 'success');
}

// 下载导出的数据为JSON文件
function downloadExportedData() {
    const jsonString = elements.exportJsonData.value;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 创建一个临时链接并触发下载
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube_channels_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 释放URL对象
    URL.revokeObjectURL(url);
    
    // 显示成功通知
    showNotification('数据已下载为JSON文件', 'success');
}

// Import data from JSON
function importData() {
    try {
        const jsonData = elements.jsonInput.value.trim();
        const importMode = elements.importMode.value;
        
        if (!jsonData) {
            showNotification('请输入JSON数据', 'error');
            return;
        }
        
        const data = JSON.parse(jsonData);
        
        // 验证数据结构
        if (!data.categories && !data.channels) {
            showNotification('数据格式无效，请确保包含categories或channels字段', 'error');
            return;
        }
        
        let categoriesAdded = 0;
        let categoriesUpdated = 0;
        let channelsAdded = 0;
        let channelsUpdated = 0;
        
        // 导入分类
        if (data.categories && Array.isArray(data.categories)) {
            data.categories.forEach(category => {
                if (!category.id || !category.name) {
                    return;
                }
                
                // 根据不同的导入模式处理
                switch (importMode) {
                    case 'smart':
                        // 智能模式：检查是否已存在相同名称的分类
                        const existingCategoryByName = appData.categories.find(c => 
                            c.name.toLowerCase() === category.name.toLowerCase());
                        
                        if (existingCategoryByName) {
                            // 更新现有分类
                            Object.assign(existingCategoryByName, {
                                ...category,
                                updatedAt: new Date().toISOString()
                            });
                            categoriesUpdated++;
                        } else {
                            // 检查ID是否存在
                            const existingCategoryById = appData.categories.find(c => c.id === category.id);
                            if (existingCategoryById) {
                                // ID已存在但名称不同，生成新ID
                                appData.categories.push({
                                    ...category,
                                    id: 'category_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                                    order: category.order || appData.categories.length + 1,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                });
                            } else {
                                // 添加新分类
                                appData.categories.push({
                                    ...category,
                                    order: category.order || appData.categories.length + 1,
                                    createdAt: category.createdAt || new Date().toISOString(),
                                    updatedAt: category.updatedAt || new Date().toISOString()
                                });
                            }
                            categoriesAdded++;
                        }
                        break;
                        
                    case 'append':
                        // 追加模式：始终生成新ID添加
                        appData.categories.push({
                            ...category,
                            id: 'category_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                            order: category.order || appData.categories.length + 1,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        categoriesAdded++;
                        break;
                        
                    case 'update':
                        // 更新模式：如果ID存在则更新，否则添加
                        const existingCategoryIndex = appData.categories.findIndex(c => c.id === category.id);
                        
                        if (existingCategoryIndex !== -1) {
                            // 更新现有分类
                            appData.categories[existingCategoryIndex] = {
                                ...appData.categories[existingCategoryIndex],
                                ...category,
                                updatedAt: new Date().toISOString()
                            };
                            categoriesUpdated++;
                        } else {
                            // 添加新分类
                            appData.categories.push({
                                ...category,
                                order: category.order || appData.categories.length + 1,
                                createdAt: category.createdAt || new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            });
                            categoriesAdded++;
                        }
                        break;
                }
            });
        }
        
        // 导入频道
        if (data.channels && Array.isArray(data.channels)) {
            data.channels.forEach(channel => {
                if (!channel.id || !channel.name || !channel.url) {
                    return;
                }
                
                // 根据不同的导入模式处理
                switch (importMode) {
                    case 'smart':
                        // 智能模式：检查是否已存在相同youtubeId或URL的频道
                        const existingChannelByYoutubeId = channel.youtubeId ? 
                            appData.channels.find(c => c.youtubeId === channel.youtubeId) : null;
                            
                        const channelUrlPattern = extractYoutubeChannelUrl(channel.url);
                        const existingChannelByUrl = channelUrlPattern ? 
                            appData.channels.find(c => extractYoutubeChannelUrl(c.url) === channelUrlPattern) : null;
                        
                        if (existingChannelByYoutubeId || existingChannelByUrl) {
                            // 更新现有频道
                            const existingChannel = existingChannelByYoutubeId || existingChannelByUrl;
                            Object.assign(existingChannel, {
                                ...channel,
                                updatedAt: new Date().toISOString()
                            });
                            channelsUpdated++;
                        } else {
                            // 检查ID是否存在
                            const existingChannelById = appData.channels.find(c => c.id === channel.id);
                            if (existingChannelById) {
                                // ID已存在但内容不同，生成新ID
                                appData.channels.push({
                                    ...channel,
                                    id: 'channel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                                    youtubeId: channel.youtubeId || extractYoutubeChannelId(channel.url) || `UC${Math.random().toString(36).substring(2, 10)}`,
                                    thumbnailUrl: channel.thumbnailUrl || `https://picsum.photos/seed/${channel.id}/64/64`,
                                    description: channel.description || '',
                                    categoryId: ensureCategoryExists(channel.categoryId),
                                    customTags: channel.customTags || [],
                                    lastUpdated: new Date().toISOString(),
                                    addedAt: new Date().toISOString()
                                });
                            } else {
                                // 添加新频道
                                appData.channels.push({
                                    ...channel,
                                    youtubeId: channel.youtubeId || extractYoutubeChannelId(channel.url) || `UC${Math.random().toString(36).substring(2, 10)}`,
                                    thumbnailUrl: channel.thumbnailUrl || `https://picsum.photos/seed/${channel.id}/64/64`,
                                    description: channel.description || '',
                                    categoryId: ensureCategoryExists(channel.categoryId),
                                    customTags: channel.customTags || [],
                                    lastUpdated: channel.lastUpdated || new Date().toISOString(),
                                    addedAt: channel.addedAt || new Date().toISOString()
                                });
                            }
                            channelsAdded++;
                        }
                        break;
                        
                    case 'append':
                        // 追加模式：始终生成新ID添加
                        appData.channels.push({
                            ...channel,
                            id: 'channel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                            youtubeId: channel.youtubeId || extractYoutubeChannelId(channel.url) || `UC${Math.random().toString(36).substring(2, 10)}`,
                            thumbnailUrl: channel.thumbnailUrl || `https://picsum.photos/seed/${Date.now()}/64/64`,
                            description: channel.description || '',
                            categoryId: ensureCategoryExists(channel.categoryId),
                            customTags: channel.customTags || [],
                            lastUpdated: new Date().toISOString(),
                            addedAt: new Date().toISOString()
                        });
                        channelsAdded++;
                        break;
                        
                    case 'update':
                        // 更新模式：如果ID存在则更新，否则添加
                        const existingChannelIndex = appData.channels.findIndex(c => c.id === channel.id);
                        
                        if (existingChannelIndex !== -1) {
                            // 更新现有频道
                            appData.channels[existingChannelIndex] = {
                                ...appData.channels[existingChannelIndex],
                                ...channel,
                                categoryId: ensureCategoryExists(channel.categoryId),
                                updatedAt: new Date().toISOString()
                            };
                            channelsUpdated++;
                        } else {
                            // 添加新频道
                            appData.channels.push({
                                ...channel,
                                youtubeId: channel.youtubeId || extractYoutubeChannelId(channel.url) || `UC${Math.random().toString(36).substring(2, 10)}`,
                                thumbnailUrl: channel.thumbnailUrl || `https://picsum.photos/seed/${channel.id}/64/64`,
                                description: channel.description || '',
                                categoryId: ensureCategoryExists(channel.categoryId),
                                customTags: channel.customTags || [],
                                lastUpdated: channel.lastUpdated || new Date().toISOString(),
                                addedAt: channel.addedAt || new Date().toISOString()
                            });
                            channelsAdded++;
                        }
                        break;
                }
            });
        }
        
        // 更新数据并刷新UI
        saveData();
        renderCategories();
        renderChannels();
        
        // 清空输入并关闭模态框
        elements.jsonInput.value = '';
        closeAllModals();
        
        // 显示成功通知
        const message = `导入成功: ${categoriesAdded}个新分类, ${categoriesUpdated}个更新分类, ${channelsAdded}个新频道, ${channelsUpdated}个更新频道`;
        showNotification(message, 'success');
        
    } catch (error) {
        console.error('导入数据失败:', error);
        showNotification('JSON格式无效，请检查数据格式', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    elements.notification.className = `notification ${type}`;
    elements.notificationMessage.textContent = message;
    elements.notification.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// 执行搜索
function performSearch() {
    const query = elements.searchInput.value.trim().toLowerCase();
    
    if (query === '') {
        // 如果搜索框为空，恢复正常显示
        clearSearch();
        return;
    }
    
    // 更新搜索状态
    appData.searchQuery = query;
    appData.isSearching = true;
    
    // 更新界面标题
    elements.currentCategoryName.textContent = `搜索结果: "${query}"`;
    
    // 渲染搜索结果
    renderSearchResults(query);
    
    // 通知用户搜索完成
    showNotification(`搜索完成，找到相关频道: "${query}"`, 'success');
}

// 清除搜索，恢复正常显示
function clearSearch() {
    appData.searchQuery = '';
    appData.isSearching = false;
    
    // 清空搜索输入框
    if (elements.searchInput) {
        elements.searchInput.value = '';
    }
    
    // 恢复当前分类标题
    if (appData.currentCategoryId === 'all') {
        elements.currentCategoryName.textContent = '全部频道';
    } else {
        const category = appData.categories.find(cat => cat.id === appData.currentCategoryId);
        elements.currentCategoryName.textContent = category ? category.name : '未知分类';
    }
    
    // 重新渲染频道列表
    renderChannels();
}

// 将函数放入全局作用域
window.clearSearch = clearSearch;

// 渲染搜索结果
function renderSearchResults(query) {
    const fragment = document.createDocumentFragment();
    
    // 计算每个分类中前5名频道
    const rankedChannels = calculateTopChannelsPerCategory();
    
    // 执行搜索，查找名称或标签匹配的频道
    let results = appData.channels.filter(channel => {
        // 检查频道名称
        const nameMatch = channel.name && channel.name.toLowerCase().includes(query);
        
        // 检查频道标签
        const tagMatch = channel.customTags && Array.isArray(channel.customTags) && 
            channel.customTags.some(tag => tag.toLowerCase().includes(query));
            
        // 如果名称或标签匹配，则返回true
        return nameMatch || tagMatch;
    });
    
    // 为搜索结果添加排名信息
    results = results.map(channel => {
        const rankInfo = rankedChannels.find(rc => rc.channelId === channel.id);
        if (rankInfo) {
            return { ...channel, rank: rankInfo.rank, categoryRank: true };
        }
        return channel;
    });
    
    // 如果没有找到结果
    if (results.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'no-search-results';
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>没有找到匹配的频道</h3>
            <p>尝试使用不同的关键词搜索</p>
            <button class="btn-secondary mt-1" onclick="clearSearch()">
                <i class="fas fa-times"></i> 清除搜索
            </button>
        `;
        fragment.appendChild(emptyState);
    } else {
        // 显示找到的结果
        results.forEach(channel => {
            const card = createChannelCard(channel, query);
            fragment.appendChild(card);
        });
    }
    
    // 清空并添加到频道网格
    elements.channelGrid.innerHTML = '';
    elements.channelGrid.appendChild(fragment);
}

// 创建频道卡片，添加高亮搜索词功能
function createChannelCard(channel, searchQuery = '') {
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.dataset.id = channel.id;
    
    // Format subscriber count
    const formattedSubscribers = formatSubscriberCount(channel.subscriberCount);
    
    // Create tags HTML with optional highlighting
    let tagsHtml = '';
    if (channel.customTags && channel.customTags.length > 0) {
        tagsHtml = '<div class="channel-tags">';
        channel.customTags.forEach(tag => {
            // 如果有搜索查询且标签包含查询，则高亮
            if (searchQuery && tag.toLowerCase().includes(searchQuery.toLowerCase())) {
                const highlightedTag = highlightText(tag, searchQuery);
                tagsHtml += `<span class="channel-tag">${highlightedTag}</span>`;
            } else {
                tagsHtml += `<span class="channel-tag">${tag}</span>`;
            }
        });
        tagsHtml += '</div>';
    }
    
    // 可能高亮的频道名称
    const channelName = searchQuery ? 
        highlightText(channel.name, searchQuery) : 
        channel.name;
    
    // 如果频道有排名，添加皇冠图标
    let rankBadgeHtml = '';
    if (channel.rank && channel.rank >= 1 && channel.rank <= 5) {
        const rankClass = `rank-${channel.rank}`;
        const categoryLabel = channel.categoryRank ? 
            `${appData.categories.find(cat => cat.id === channel.categoryId)?.name || ''}分类第${channel.rank}名` : 
            `第${channel.rank}名`;
            
        rankBadgeHtml = `
            <div class="rank-badge ${rankClass}" title="${categoryLabel}">
                <i class="fas fa-crown crown"></i>
                <span class="rank-number">${channel.rank}</span>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="channel-avatar">
            <img src="${channel.thumbnailUrl || 'https://via.placeholder.com/64'}" alt="${channel.name}">
            <div class="orbit-effect"></div>
        </div>
        ${rankBadgeHtml}
        <div class="channel-info">
            <h3 class="channel-name">${channelName}</h3>
            <div class="channel-subscribers">${formattedSubscribers} 位订阅者</div>
            ${tagsHtml}
        </div>
        <div class="channel-actions">
            <button class="btn-visit" onclick="window.open('${channel.url}', '_blank')">
                <i class="fas fa-external-link-alt"></i> 访问频道
            </button>
        </div>
    `;
    
    // Add context menu event
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showChannelContextMenu(e, channel.id);
    });
    
    // 添加光圈效果
    createOrbitEffect(card.querySelector('.orbit-effect'));
    
    return card;
}

// 高亮文本中匹配的部分
function highlightText(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// 转义正则表达式中的特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 