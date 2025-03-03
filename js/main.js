// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取表单元素
    const form = document.getElementById('compatibility-form');
    const resultsSection = document.getElementById('results-section');
    const newTestButton = document.getElementById('new-test');
    const shareButton = document.getElementById('share-result');
    
    // 添加 API Key 设置功能
    setupApiKeyInput();
    
    // 表单提交事件处理
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); // 阻止表单默认提交行为
        
        // 显示加载状态
        showLoading(true);
        
        // 获取表单数据
        const formData = {
            person1: {
                name: document.getElementById('name1').value,
                gender: document.getElementById('gender1').value,
                birthday: document.getElementById('birthday1').value,
                hobbies: document.getElementById('hobby1').value.split(',').map(h => h.trim()).filter(h => h),
                values: document.getElementById('values1').value.split(',').map(v => v.trim()).filter(v => v),
                communication: document.getElementById('communication1').value
            },
            person2: {
                name: document.getElementById('name2').value,
                gender: document.getElementById('gender2').value,
                birthday: document.getElementById('birthday2').value,
                hobbies: document.getElementById('hobby2').value.split(',').map(h => h.trim()).filter(h => h),
                values: document.getElementById('values2').value.split(',').map(v => v.trim()).filter(v => v),
                communication: document.getElementById('communication2').value
            }
        };
        
        try {
            // 调用预测函数（现在是异步的）
            const result = await window.PredictionAPI.predictCompatibility(formData);
            
            // 显示结果
            displayResults(result);
        } catch (error) {
            // 显示错误信息
            showError(error.message);
        } finally {
            // 隐藏加载状态
            showLoading(false);
        }
    });
    
    // 重新测试按钮点击事件
    newTestButton.addEventListener('click', function() {
        // 隐藏结果区域
        resultsSection.style.display = 'none';
        resultsSection.classList.remove('visible');
        
        // 重置表单
        form.reset();
        
        // 滚动到表单位置
        document.querySelector('.prediction-form').scrollIntoView({
            behavior: 'smooth'
        });
    });
    
    // 分享结果按钮点击事件
    shareButton.addEventListener('click', function() {
        // 获取当前结果
        const score = document.getElementById('score-value').textContent;
        const names = `${document.getElementById('name1').value} & ${document.getElementById('name2').value}`;
        
        // 创建分享文本
        const shareText = `我和${names}的爱情契合度是${score}%！来测测你们的契合度吧：`;
        
        // 检查是否支持网页分享API
        if (navigator.share) {
            navigator.share({
                title: 'AI恋爱契合度预测结果',
                text: shareText,
                url: window.location.href
            })
            .catch(error => {
                console.log('分享失败:', error);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
    });
    
    // 设置 API Key 输入功能
    function setupApiKeyInput() {
        // 创建 API Key 设置按钮
        const settingsButton = document.createElement('button');
        settingsButton.type = 'button';
        settingsButton.className = 'settings-button';
        settingsButton.innerHTML = '<span class="settings-icon">⚙️</span>';
        settingsButton.title = '设置 DeepSeek API Key';
        
        // 添加到页面
        const header = document.querySelector('header .container');
        header.appendChild(settingsButton);
        
        // 创建设置对话框
        const settingsDialog = document.createElement('div');
        settingsDialog.className = 'settings-dialog';
        settingsDialog.innerHTML = `
            <div class="settings-content">
                <h3>设置 DeepSeek API Key</h3>
                <p>请输入您的 DeepSeek API Key 以启用高级 AI 分析功能。</p>
                <div class="form-group">
                    <label for="api-key">API Key</label>
                    <input type="password" id="api-key" placeholder="sk-...">
                </div>
                <div class="dialog-actions">
                    <button type="button" class="btn-primary save-api-key">保存</button>
                    <button type="button" class="btn-secondary cancel-dialog">取消</button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(settingsDialog);
        
        // 设置按钮点击事件
        settingsButton.addEventListener('click', function() {
            settingsDialog.classList.add('visible');
            // 从本地存储加载已保存的 API Key
            const savedKey = localStorage.getItem('deepseek_api_key');
            if (savedKey) {
                document.getElementById('api-key').value = savedKey;
            }
        });
        
        // 保存按钮点击事件
        settingsDialog.querySelector('.save-api-key').addEventListener('click', function() {
            const apiKey = document.getElementById('api-key').value.trim();
            if (apiKey) {
                // 保存到本地存储
                saveApiKey(apiKey);
                // 设置到 API 模块
                window.PredictionAPI.setApiKey(apiKey);
                // 显示成功消息
                showMessage('API Key 已保存');
            } else {
                showMessage('请输入有效的 API Key', true);
            }
            settingsDialog.classList.remove('visible');
        });
        
        // 取消按钮点击事件
        settingsDialog.querySelector('.cancel-dialog').addEventListener('click', function() {
            settingsDialog.classList.remove('visible');
        });
        
        // 点击对话框外部关闭
        settingsDialog.addEventListener('click', function(e) {
            if (e.target === settingsDialog) {
                settingsDialog.classList.remove('visible');
            }
        });
        
        // 从本地存储加载已保存的 API Key
        const savedKey = localStorage.getItem('deepseek_api_key');
        if (savedKey) {
            window.PredictionAPI.setApiKey(savedKey);
        }
    }
    
    // 显示加载状态
    function showLoading(isLoading) {
        const loadingElement = document.querySelector('.loading-overlay') || createLoadingElement();
        
        if (isLoading) {
            loadingElement.style.display = 'flex';
        } else {
            loadingElement.style.display = 'none';
        }
    }
    
    // 创建加载元素
    function createLoadingElement() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <p>正在分析中，请稍候...</p>
        `;
        document.body.appendChild(loadingElement);
        return loadingElement;
    }
    
    // 显示错误信息
    function showError(message) {
        showMessage(message, true);
    }
    
    // 显示消息
    function showMessage(message, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isError ? 'error' : 'success'}`;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);
        
        // 3秒后自动消失
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 500);
        }, 3000);
    }
    
    // 备用分享方法（复制到剪贴板）
    function fallbackShare(text) {
        // 创建临时输入框
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        
        // 显示提示
        showMessage('分享文本已复制到剪贴板！');
    }
    
    // 显示结果的函数
    function displayResults(result) {
        // 设置分数
        const scoreElement = document.getElementById('score-value');
        scoreElement.textContent = '0'; // 初始值
        
        // 设置详细内容
        const resultContent = document.getElementById('result-content');
        resultContent.innerHTML = `
            <p><strong>${result.person1.name}</strong> 和 <strong>${result.person2.name}</strong> 的契合度分析：</p>
            <ul>
                <li>性格匹配度: ${result.details.personality}%</li>
                <li>兴趣爱好相似度: ${result.details.hobbies}%</li>
                <li>生活习惯兼容性: ${result.details.lifestyle}%</li>
                <li>星座匹配度: ${result.details.zodiac}%</li>
                <li>长期发展潜力: ${result.details.longTerm}%</li>
            </ul>
            <p class="analysis-summary">${result.summary}</p>
        `;
        
        // 显示结果区域
        resultsSection.style.display = 'block';
        
        // 添加可见性类以触发动画
        setTimeout(() => {
            resultsSection.classList.add('visible');
        }, 10);
        
        // 滚动到结果区域
        resultsSection.scrollIntoView({
            behavior: 'smooth'
        });
        
        // 数字增长动画
        let count = 0;
        const targetScore = result.score;
        const duration = 1500; // 动画持续时间（毫秒）
        const interval = 20; // 更新间隔（毫秒）
        const steps = duration / interval;
        const increment = targetScore / steps;
        
        const counter = setInterval(() => {
            count += increment;
            if (count >= targetScore) {
                count = targetScore;
                clearInterval(counter);
            }
            scoreElement.textContent = Math.round(count);
        }, interval);
        
        // 生成雷达图
        generateRadarChart(result.details);
    }
    
    // 添加雷达图生成函数
    function generateRadarChart(details) {
        const ctx = document.getElementById('compatibility-radar-chart').getContext('2d');
        
        // 如果已经有图表，先销毁
        if (window.compatibilityChart) {
            window.compatibilityChart.destroy();
        }
        
        // 创建新图表
        window.compatibilityChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['性格匹配度', '兴趣爱好相似度', '生活习惯兼容性', '星座匹配度', '长期发展潜力'],
                datasets: [{
                    label: '契合度分析',
                    data: [
                        details.personality,
                        details.hobbies,
                        details.lifestyle,
                        details.zodiac,
                        details.longTerm
                    ],
                    backgroundColor: 'rgba(232, 62, 140, 0.2)',
                    borderColor: 'rgba(232, 62, 140, 1)',
                    pointBackgroundColor: 'rgba(232, 62, 140, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(232, 62, 140, 1)'
                }]
            },
            options: {
                scale: {
                    ticks: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // 改进 API Key 存储方式
    function saveApiKey(key) {
        // 简单加密（实际应用中应使用更安全的方式）
        const encryptedKey = btoa(key);
        localStorage.setItem('deepseek_api_key_enc', encryptedKey);
    }
    
    function getApiKey() {
        const encryptedKey = localStorage.getItem('deepseek_api_key_enc');
        if (encryptedKey) {
            return atob(encryptedKey);
        }
        return null;
    }
}); 