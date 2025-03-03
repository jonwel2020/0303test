/**
 * 动画效果处理
 * 这个文件包含网站中使用的各种动画效果
 */

document.addEventListener('DOMContentLoaded', function() {
    // 添加页面滚动动画
    addScrollAnimations();
    
    // 添加表单输入动画
    addFormInputAnimations();
    
    // 添加卡片悬停效果
    addCardHoverEffects();
});

// 添加页面滚动动画
function addScrollAnimations() {
    // 获取所有需要动画的元素
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-delay');
    
    // 检查元素是否在视口中
    function checkIfInView() {
        const windowHeight = window.innerHeight;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + windowHeight;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top + windowTop;
            const elementBottom = elementTop + element.offsetHeight;
            
            // 如果元素在视口中，添加可见类
            if (elementBottom > windowTop && elementTop < windowBottom) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // 初始检查
    checkIfInView();
    
    // 滚动时检查
    window.addEventListener('scroll', checkIfInView);
}

// 添加表单输入动画
function addFormInputAnimations() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // 获取输入框的标签
        const label = input.previousElementSibling;
        
        // 焦点动画
        input.addEventListener('focus', () => {
            if (label) {
                label.style.color = '#e83e8c';
            }
            input.parentElement.classList.add('active');
        });
        
        // 失去焦点动画
        input.addEventListener('blur', () => {
            if (label) {
                label.style.color = '';
            }
            input.parentElement.classList.remove('active');
        });
    });
}

// 添加卡片悬停效果
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });
}

// 添加结果显示动画
function animateResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('visible');
    }
}

// 数字增长动画
function animateNumber(element, targetNumber, duration = 1500) {
    let startNumber = 0;
    const increment = targetNumber / (duration / 20);
    const timer = setInterval(() => {
        startNumber += increment;
        if (startNumber >= targetNumber) {
            clearInterval(timer);
            startNumber = targetNumber;
        }
        element.textContent = Math.round(startNumber);
    }, 20);
}

// 导出动画函数供其他文件使用
window.Animations = {
    animateResults: animateResults,
    animateNumber: animateNumber
}; 