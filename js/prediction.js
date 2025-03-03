/**
 * AI恋爱/婚姻契合度预测算法
 * 这个文件包含预测两个人契合度的核心算法，使用 DeepSeek 大模型 API
 */

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com';
let apiKey = ''; // 用户需要在界面上输入自己的 API Key

// 主预测函数
async function predictCompatibility(data) {
    // 提取两个人的信息
    const person1 = data.person1;
    const person2 = data.person2;
    
    try {
        // 调用 DeepSeek API 进行分析
        const result = await analyzeCompatibilityWithDeepSeek(person1, person2);
        return result;
    } catch (error) {
        console.error('DeepSeek API 调用失败:', error);
        // 如果 API 调用失败，回退到本地算法
        return fallbackLocalPrediction(person1, person2);
    }
}

// 使用 DeepSeek API 分析契合度
async function analyzeCompatibilityWithDeepSeek(person1, person2) {
    // 检查是否有 API Key
    if (!apiKey) {
        throw new Error('未设置 DeepSeek API Key');
    }
    
    // 构建发送给 DeepSeek 的提示信息
    const prompt = `
    作为一个专业的恋爱/婚姻契合度分析专家，请分析以下两个人的匹配程度：
    
    第一个人信息:
    - 姓名: ${person1.name}
    - 性别: ${person1.gender}
    - 出生日期: ${person1.birthday}
    - 兴趣爱好: ${person1.hobbies.join(', ')}
    
    第二个人信息:
    - 姓名: ${person2.name}
    - 性别: ${person2.gender}
    - 出生日期: ${person2.birthday}
    - 兴趣爱好: ${person2.hobbies.join(', ')}
    
    请从以下几个维度进行分析，并给出百分比评分（0-100）：
    1. 性格匹配度
    2. 兴趣爱好相似度
    3. 生活习惯兼容性
    4. 星座匹配度
    5. 长期发展潜力
    
    然后给出总体契合度评分（0-100），并提供一段详细的分析总结。
    
    请以JSON格式返回结果，格式如下：
    {
        "score": 总体评分,
        "details": {
            "personality": 性格匹配度评分,
            "hobbies": 兴趣爱好相似度评分,
            "lifestyle": 生活习惯兼容性评分,
            "zodiac": 星座匹配度评分,
            "longTerm": 长期发展潜力评分
        },
        "summary": "详细分析总结"
    }
    `;
    
    // 调用 DeepSeek API
    const response = await fetch(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: '你是一个专业的恋爱/婚姻契合度分析专家，擅长分析两个人的匹配程度。' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // 解析 API 返回的结果
    try {
        // 从回复中提取 JSON 部分
        const content = responseData.choices[0].message.content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
        
        let result;
        if (jsonMatch) {
            result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
            throw new Error('无法解析 API 返回的 JSON 数据');
        }
        
        // 添加人员信息到结果中
        result.person1 = person1;
        result.person2 = person2;
        
        return result;
    } catch (error) {
        console.error('解析 API 返回数据失败:', error);
        throw error;
    }
}

// 本地预测算法（作为备用）
function fallbackLocalPrediction(person1, person2) {
    // 计算各个维度的匹配度
    const personalityScore = calculatePersonalityMatch(person1, person2);
    const hobbiesScore = calculateHobbiesMatch(person1.hobbies, person2.hobbies);
    const lifestyleScore = calculateLifestyleMatch(person1, person2);
    const zodiacScore = calculateZodiacMatch(person1.birthday, person2.birthday);
    const longTermScore = calculateLongTermPotential(person1, person2);
    
    // 计算总分（加权平均）
    const totalScore = Math.round(
        personalityScore * 0.25 +
        hobbiesScore * 0.2 +
        lifestyleScore * 0.2 +
        zodiacScore * 0.15 +
        longTermScore * 0.2
    );
    
    // 生成分析总结
    const summary = generateSummary(totalScore, person1.name, person2.name);
    
    // 返回结果对象
    return {
        score: totalScore,
        person1: person1,
        person2: person2,
        details: {
            personality: personalityScore,
            hobbies: hobbiesScore,
            lifestyle: lifestyleScore,
            zodiac: zodiacScore,
            longTerm: longTermScore
        },
        summary: summary
    };
}

// 设置 API Key
function setApiKey(key) {
    apiKey = key;
}

// 计算性格匹配度（基于姓名和生日的模拟算法）
function calculatePersonalityMatch(person1, person2) {
    // 这里使用姓名和生日的字符串特征来模拟性格匹配
    // 实际应用中可以接入真实的性格测试API
    
    // 从姓名中提取特征
    const nameCompatibility = calculateNameCompatibility(person1.name, person2.name);
    
    // 从生日中提取特征
    const birthdayCompatibility = calculateBirthdayCompatibility(person1.birthday, person2.birthday);
    
    // 从性别中提取特征
    const genderCompatibility = calculateGenderCompatibility(person1.gender, person2.gender);
    
    // 加权平均
    return Math.round(nameCompatibility * 0.4 + birthdayCompatibility * 0.4 + genderCompatibility * 0.2);
}

// 计算姓名匹配度
function calculateNameCompatibility(name1, name2) {
    // 简单算法：计算两个名字的字符重叠度
    const set1 = new Set(name1.toLowerCase().split(''));
    const set2 = new Set(name2.toLowerCase().split(''));
    
    // 计算交集大小
    let intersection = 0;
    for (const char of set1) {
        if (set2.has(char)) {
            intersection++;
        }
    }
    
    // 计算并集大小
    const union = set1.size + set2.size - intersection;
    
    // 计算Jaccard相似度并转换为百分比
    const similarity = (intersection / union) * 100;
    
    // 添加随机因素，使结果更有趣
    return Math.min(100, Math.max(40, Math.round(similarity + Math.random() * 30)));
}

// 计算生日匹配度
function calculateBirthdayCompatibility(birthday1, birthday2) {
    // 解析日期
    const date1 = new Date(birthday1);
    const date2 = new Date(birthday2);
    
    // 计算年龄差异（以年为单位）
    const yearDiff = Math.abs(date1.getFullYear() - date2.getFullYear());
    
    // 年龄差异评分（差异越小，分数越高）
    const ageDiffScore = Math.max(0, 100 - yearDiff * 5);
    
    // 计算生日月份和日期的匹配度
    const monthDiff = Math.abs(date1.getMonth() - date2.getMonth());
    const dayDiff = Math.abs(date1.getDate() - date2.getDate());
    
    // 月份和日期差异评分
    const monthDayScore = Math.max(0, 100 - monthDiff * 8 - dayDiff * 1.5);
    
    // 加权平均
    return Math.round(ageDiffScore * 0.7 + monthDayScore * 0.3);
}

// 计算性别匹配度
function calculateGenderCompatibility(gender1, gender2) {
    // 简单的性别匹配逻辑
    if (gender1 === gender2) {
        // 同性匹配
        return 85 + Math.floor(Math.random() * 16); // 85-100之间的随机数
    } else if (gender1 !== gender2) {
        // 异性匹配
        return 85 + Math.floor(Math.random() * 16); // 85-100之间的随机数
    } else {
        // 其他情况
        return 70 + Math.floor(Math.random() * 31); // 70-100之间的随机数
    }
}

// 计算兴趣爱好匹配度
function calculateHobbiesMatch(hobbies1, hobbies2) {
    // 如果两人都没有填写兴趣爱好，返回中等分数
    if (hobbies1.length === 0 && hobbies2.length === 0) {
        return 50;
    }
    
    // 如果其中一人没有填写兴趣爱好，返回较低分数
    if (hobbies1.length === 0 || hobbies2.length === 0) {
        return 40 + Math.floor(Math.random() * 20); // 40-59之间的随机数
    }
    
    // 将兴趣爱好转换为小写以进行不区分大小写的比较
    const lowerHobbies1 = hobbies1.map(h => h.toLowerCase());
    const lowerHobbies2 = hobbies2.map(h => h.toLowerCase());
    
    // 计算共同兴趣爱好数量
    let commonHobbies = 0;
    for (const hobby of lowerHobbies1) {
        if (lowerHobbies2.some(h => h.includes(hobby) || hobby.includes(h))) {
            commonHobbies++;
        }
    }
    
    // 计算相似度
    const totalUniqueHobbies = new Set([...lowerHobbies1, ...lowerHobbies2]).size;
    const similarityRatio = commonHobbies / totalUniqueHobbies;
    
    // 转换为百分比分数，并添加一些随机性
    return Math.min(100, Math.max(30, Math.round(similarityRatio * 100 + Math.random() * 20)));
}

// 计算生活习惯匹配度（基于生日和性别的模拟算法）
function calculateLifestyleMatch(person1, person2) {
    // 从生日中提取月份作为季节偏好的代表
    const month1 = new Date(person1.birthday).getMonth();
    const month2 = new Date(person2.birthday).getMonth();
    
    // 计算月份差异（0-6之间）
    const monthDiff = Math.min(Math.abs(month1 - month2), 12 - Math.abs(month1 - month2));
    const seasonScore = Math.max(0, 100 - monthDiff * 15);
    
    // 从生日中提取日期作为作息习惯的代表
    const day1 = new Date(person1.birthday).getDate();
    const day2 = new Date(person2.birthday).getDate();
    
    // 计算日期差异（0-15之间）
    const dayDiff = Math.min(Math.abs(day1 - day2), 31 - Math.abs(day1 - day2));
    const routineScore = Math.max(0, 100 - dayDiff * 5);
    
    // 加权平均并添加随机因素
    const baseScore = seasonScore * 0.4 + routineScore * 0.6;
    return Math.min(100, Math.max(40, Math.round(baseScore + Math.random() * 15)));
}

// 计算星座匹配度
function calculateZodiacMatch(birthday1, birthday2) {
    // 获取两人的星座
    const zodiac1 = getZodiacSign(birthday1);
    const zodiac2 = getZodiacSign(birthday2);
    
    // 星座匹配表（简化版）
    const zodiacCompatibility = {
        'Aries': { 'Aries': 70, 'Taurus': 60, 'Gemini': 85, 'Cancer': 65, 'Leo': 90, 'Virgo': 50, 'Libra': 80, 'Scorpio': 70, 'Sagittarius': 90, 'Capricorn': 55, 'Aquarius': 75, 'Pisces': 65 },
        'Taurus': { 'Aries': 60, 'Taurus': 80, 'Gemini': 55, 'Cancer': 90, 'Leo': 70, 'Virgo': 95, 'Libra': 75, 'Scorpio': 85, 'Sagittarius': 50, 'Capricorn': 95, 'Aquarius': 60, 'Pisces': 85 },
        'Gemini': { 'Aries': 85, 'Taurus': 55, 'Gemini': 75, 'Cancer': 60, 'Leo': 85, 'Virgo': 75, 'Libra': 90, 'Scorpio': 60, 'Sagittarius': 85, 'Capricorn': 50, 'Aquarius': 90, 'Pisces': 65 },
        'Cancer': { 'Aries': 65, 'Taurus': 90, 'Gemini': 60, 'Cancer': 85, 'Leo': 65, 'Virgo': 80, 'Libra': 60, 'Scorpio': 95, 'Sagittarius': 55, 'Capricorn': 75, 'Aquarius': 50, 'Pisces': 95 },
        'Leo': { 'Aries': 90, 'Taurus': 70, 'Gemini': 85, 'Cancer': 65, 'Leo': 80, 'Virgo': 60, 'Libra': 90, 'Scorpio': 70, 'Sagittarius': 90, 'Capricorn': 55, 'Aquarius': 70, 'Pisces': 65 },
        'Virgo': { 'Aries': 50, 'Taurus': 95, 'Gemini': 75, 'Cancer': 80, 'Leo': 60, 'Virgo': 75, 'Libra': 65, 'Scorpio': 85, 'Sagittarius': 55, 'Capricorn': 90, 'Aquarius': 60, 'Pisces': 80 },
        'Libra': { 'Aries': 80, 'Taurus': 75, 'Gemini': 90, 'Cancer': 60, 'Leo': 90, 'Virgo': 65, 'Libra': 75, 'Scorpio': 70, 'Sagittarius': 85, 'Capricorn': 65, 'Aquarius': 90, 'Pisces': 70 },
        'Scorpio': { 'Aries': 70, 'Taurus': 85, 'Gemini': 60, 'Cancer': 95, 'Leo': 70, 'Virgo': 85, 'Libra': 70, 'Scorpio': 85, 'Sagittarius': 60, 'Capricorn': 85, 'Aquarius': 55, 'Pisces': 95 },
        'Sagittarius': { 'Aries': 90, 'Taurus': 50, 'Gemini': 85, 'Cancer': 55, 'Leo': 90, 'Virgo': 55, 'Libra': 85, 'Scorpio': 60, 'Sagittarius': 80, 'Capricorn': 65, 'Aquarius': 90, 'Pisces': 60 },
        'Capricorn': { 'Aries': 55, 'Taurus': 95, 'Gemini': 50, 'Cancer': 75, 'Leo': 55, 'Virgo': 90, 'Libra': 65, 'Scorpio': 85, 'Sagittarius': 65, 'Capricorn': 80, 'Aquarius': 70, 'Pisces': 85 },
        'Aquarius': { 'Aries': 75, 'Taurus': 60, 'Gemini': 90, 'Cancer': 50, 'Leo': 70, 'Virgo': 60, 'Libra': 90, 'Scorpio': 55, 'Sagittarius': 90, 'Capricorn': 70, 'Aquarius': 80, 'Pisces': 75 },
        'Pisces': { 'Aries': 65, 'Taurus': 85, 'Gemini': 65, 'Cancer': 95, 'Leo': 65, 'Virgo': 80, 'Libra': 70, 'Scorpio': 95, 'Sagittarius': 60, 'Capricorn': 85, 'Aquarius': 75, 'Pisces': 85 }
    };
    
    // 获取匹配分数
    let score = 70; // 默认分数
    if (zodiacCompatibility[zodiac1] && zodiacCompatibility[zodiac1][zodiac2]) {
        score = zodiacCompatibility[zodiac1][zodiac2];
    }
    
    // 添加一些随机性
    return Math.min(100, Math.max(40, score + Math.floor(Math.random() * 11) - 5));
}

// 获取星座
function getZodiacSign(birthday) {
    const date = new Date(birthday);
    const day = date.getDate();
    const month = date.getMonth() + 1; // 月份从0开始，需要+1
    
    // 确定星座
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    return 'Capricorn';
}

// 计算长期发展潜力
function calculateLongTermPotential(person1, person2) {
    // 结合前面的各项指标，计算长期发展潜力
    const personalityScore = calculatePersonalityMatch(person1, person2);
    const hobbiesScore = calculateHobbiesMatch(person1.hobbies, person2.hobbies);
    const lifestyleScore = calculateLifestyleMatch(person1, person2);
    
    // 长期潜力更注重性格和生活习惯的匹配
    const baseScore = personalityScore * 0.4 + hobbiesScore * 0.3 + lifestyleScore * 0.3;
    
    // 添加一些随机因素
    return Math.min(100, Math.max(40, Math.round(baseScore + Math.random() * 10 - 5)));
}

// 生成分析总结
function generateSummary(score, name1, name2) {
    if (score >= 90) {
        return `${name1}和${name2}的契合度非常高！你们就像是命中注定的一对，在多个方面都有着惊人的相似性和互补性。无论是性格、兴趣还是生活习惯，你们都能很好地融合在一起。这种高度匹配的关系有望发展成为长久而幸福的伴侣关系。`;
    } else if (score >= 80) {
        return `${name1}和${name2}的契合度很高！你们在重要的方面有着良好的匹配度，彼此之间的吸引力和理解力都很强。虽然可能在某些小方面存在差异，但这些差异往往能够互相补充，使关系更加丰富多彩。`;
    } else if (score >= 70) {
        return `${name1}和${name2}的契合度良好。你们有足够的共同点来建立稳定的关系，同时也有一些差异带来新鲜感。通过良好的沟通和相互尊重，你们的关系有很大的发展潜力。`;
    } else if (score >= 60) {
        return `${name1}和${name2}的契合度中等。你们在某些方面很合拍，但在其他方面可能需要更多的理解和包容。这种关系需要双方都愿意做出一些妥协，但如果处理得当，也能发展成为稳定的伴侣关系。`;
    } else if (score >= 50) {
        return `${name1}和${name2}的契合度一般。你们可能在重要的生活方面有着不同的观念和习惯，这需要双方付出更多努力来维持关系的和谐。不过，差异也能带来学习和成长的机会，如果双方都有意愿，这种关系仍然可以发展。`;
    } else {
        return `${name1}和${name2}的契合度较低。你们在多个重要方面可能存在较大差异，这可能会导致关系中出现更多的挑战和摩擦。不过，爱情有时就是克服困难的过程，如果双方都愿意为对方改变和成长，任何关系都有可能成功。`;
    }
}

// 导出函数供其他文件使用
window.PredictionAPI = {
    predictCompatibility: predictCompatibility,
    setApiKey: setApiKey
}; 