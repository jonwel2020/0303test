// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取表单元素
    const form = document.getElementById('compatibility-form');
    const resultsSection = document.getElementById('results-section');
    const newTestButton = document.getElementById('new-test');
    const shareButton = document.getElementById('share-result');
    
    // 表单提交事件处理
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交行为
        
        // 获取表单数据
        const formData = {
            person1: {
                name: document.getElementById('name1').value,
                gender: document.getElementById('gender1').value,
                birthday: document.getElementById('birthday1').value,
                hobbies: document.getElementById('hobby1').value.split(',').map(h => h.trim())
            },
            person2: {
                name: document.getElementById('name2').value,
                gender: document.getElementById('gender2').value,
                birthday: document.getElementById('birthday2').value,
                hobbies: document.getElementById('hobby2').value.split(',').map(h => h.trim())
            }
        };
        
        // 调用预测函数
        const result = predictCompatibility(formData);
        
        // 显示结果
        displayResults(result);
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
        alert('分享文本已复制到剪贴板！');
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
    }
}); 