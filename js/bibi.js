//bbtalkLunboer v2.0 By Ariasaka
AV.init({
    appId: "5Qz83rfo5g2jJHlKCSdb61QB-gzGzoHsz",
    appKey: "izOzmhweLBq2dHjcTCbZyMyk",
    serverURL: "https://5qz83rfo.lc-cn-n1-shared.com"
});

function lunbo(){
    var speaks=[];
    const query = new AV.Query('content');
    
    Date.prototype.Format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    
    query.find().then((talks) => {
        dat = new Date();
        
        // ✅ 修复：修改循环条件，从 talks.length-1 开始
        for(let i = talks.length - 1; i >= Math.max(0, talks.length - 32); i--){
            // ✅ 添加安全检查
            if (!talks[i] || !talks[i]["createdAt"]) continue;
            
            var usedTime = Date.parse(dat) - Date.parse(talks[i]["createdAt"]);
            var days = Math.floor(usedTime / (24 * 3600 * 1000));
            var leave1 = usedTime % (24 * 3600 * 1000);  
            var hours = Math.floor(leave1 / (3600 * 1000));
            var leave2 = leave1 % (3600 * 1000);   
            var minutes = Math.floor(leave2 / (60 * 1000));
            
            // ✅ 添加更多安全检查
            var bbcontent = talks[i]["attributes"] && talks[i]["attributes"]["content"] 
                ? talks[i]["attributes"]["content"]
                    .replace(/<[^>]+>/g, "")
                    .replace(/<[^>]+>/g, "")
                    .replace(/(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+\.(png|jpg|jpeg|webp)/g,"[图片]")
                    .replace(/(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+/g,"[链接]")
                : "[内容为空]";
            
            if(days > 31){
                speaks.push(String(talks[i]["createdAt"].Format("yyyy-MM-dd")) + "：" + bbcontent)
            }
            else if(days > 0){
                speaks.push(String(days) + " 天前：" + bbcontent);
            }
            else if(hours > 0){
                speaks.push(String(hours) + " 小时前：" + bbcontent);
            }
            else{
                speaks.push(String(minutes) + " 分钟前：" + bbcontent);
            }
        }
        
        document.querySelector(".shuoshuo").innerHTML = "";
        for(let i = 0; i < speaks.length; i++){
            var ch = document.createElement("div");
            ch.className = "swiper-slide bbtalks";
            ch.innerHTML = speaks[i];
            document.querySelector(".shuoshuo").appendChild(ch);
        }
        
        var fxxkccf = new Swiper("#speaks-content", {
            loop: true,
            direction: "vertical",
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            mousewheel: true,
        });
        
        fxxkccf.el.onmouseover = function(){
            fxxkccf.autoplay.stop();
        }
        fxxkccf.el.onmouseout = function(){
            fxxkccf.autoplay.start();
        }
    }).catch(error => {
        console.error('获取数据失败:', error);
    });
}

document.addEventListener('pjax:complete', (e) => {
    lunbo();
});

document.addEventListener('DOMContentLoaded', (e) => {
    lunbo();
});

// 使用已有的 LeanCloud 配置
// 确保 bbtalkLunboer.js 已经初始化了 AV

// 为唠叨页面获取数据的函数
function getBibiDataForPage() {
    return new Promise((resolve, reject) => {
        const query = new AV.Query('content');
        query.descending('createdAt'); // 按时间倒序排列
        query.limit(100); // 获取更多数据
        
        query.find().then((talks) => {
            if (!talks || talks.length === 0) {
                resolve([]);
                return;
            }
            
            const processedData = talks.map((talk, index) => {
                if (!talk || !talk.attributes) return null;
                
                // 使用相同的内容处理逻辑
                const bbcontent = talk["attributes"] && talk["attributes"]["content"] 
                    ? talk["attributes"]["content"]
                        .replace(/<[^>]+>/g, "")
                        .replace(/<[^>]+>/g, "")
                        .replace(/(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+\.(png|jpg|jpeg|webp)/g,"🖼️")
                        .replace(/(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+/g,"🔗")
                    : "📝";
                
                // 格式化日期
                const fullTime = new Date(talk.createdAt);
                const timeText = fullTime.toLocaleDateString();
                
                return {
                    content: bbcontent,
                    timeText: timeText,
                    fullTime: fullTime.toLocaleString(),
                    index: index + 1,
                    total: talks.length
                };
            }).filter(item => item !== null); // 过滤掉空数据
            
            resolve(processedData);
        }).catch(error => {
            console.error('获取唠叨数据失败:', error);
            reject(error);
        });
    });
}

// 简单的瀑布流布局
function waterfallLayout(container, items, columns = 3, gap = 15) {
    const containerWidth = container.offsetWidth;
    const columnWidth = (containerWidth - (columns - 1) * gap) / columns;
    const columnHeights = new Array(columns).fill(0);
    
    items.forEach((item, index) => {
        const columnIndex = index % columns;
        const left = columnIndex * (columnWidth + gap);
        const top = columnHeights[columnIndex];
        
        item.style.width = columnWidth + 'px';
        item.style.left = left + 'px';
        item.style.top = top + 'px';
        
        // 更新列高度
        columnHeights[columnIndex] += item.offsetHeight + gap;
    });
    
    // 设置容器高度
    container.style.height = Math.max(...columnHeights) + 'px';
}

// 渲染唠叨卡片
function renderBibiCards(data) {
    const bbMain = document.getElementById('bb-main');
    const bbInfo = document.querySelector('.bb-info');
    
    if (!data || data.length === 0) {
        bbMain.innerHTML = `
            <div id="bb-empty">
                <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                <div>暂无唠叨内容</div>
                <div style="font-size: 14px; opacity: 0.7; margin-top: 8px;">快来发布第一条唠叨吧～</div>
            </div>
        `;
        bbInfo.textContent = '💭 我的唠叨 (0)';
        // 即使是空状态，也要移除loading类，以防万一
        bbMain.classList.remove('loading'); 
        return;
    }
    
    bbMain.innerHTML = ''; // 清空加载状态
    bbInfo.textContent = `💭 我的唠叨 (${data.length})`;
    
    const items = [];
    
    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'bb-item card-widget';
        
        card.innerHTML = `
            <div class="bb-content">${item.content}</div>
            <div class="bb-bottombar">
                <span class="bb-time">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--fa6-solid" width="1em" height="1em" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M256 0a256 256 0 1 1 0 512a256 256 0 1 1 0-512m-24 120v136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24"></path>
                    </svg>
                    <span class="bb-time-text">${item.timeText}</span>
                </span>
                <button class="bb-comment-button">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--fa6-solid" width="1em" height="1em" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9s-1.1-12.8 3.4-17.4l.3-.3c.3-.3.7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208"></path>
                    </svg>
                </button>
            </div>
        `;
        
        bbMain.appendChild(card);
        items.push(card);
    });
    
    // 应用瀑布流布局
    setTimeout(() => {
        waterfallLayout(bbMain, items);
        // ✅ 【关键】在布局完成后，移除 'loading' 类，让卡片瞬间显示
        bbMain.classList.remove('loading');
    }, 100);
}

// 窗口调整时重新布局
function handleResize() {
    const bbMain = document.getElementById('bb-main');
    
    // ✅ 修复：添加空值检查
    if (!bbMain) {
        console.log('🔧 bb-main元素不存在，跳过调整大小');
        return;
    }
    const items = Array.from(bbMain.querySelectorAll('.bb-item'));
    if (items.length > 0) {
        waterfallLayout(bbMain, items);
    }
}

// 显示加载状态
function showLoading() {
    const bbMain = document.getElementById('bb-main');
    bbMain.innerHTML = `
        <div id="bb-loading">
            <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
            <div>正在加载唠叨...</div>
        </div>
    `;
}

// 显示错误状态
function showError() {
    const bbMain = document.getElementById('bb-main');
    bbMain.innerHTML = `
        <div id="bb-error">
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            <div>加载失败</div>
            <div style="font-size: 14px; opacity: 0.7; margin-top: 8px;">请刷新页面重试</div>
        </div>
    `;
}

// 初始化唠叨页面
function initBibiPage() {
    // 如果不在唠叨页面，则不执行
    if (!document.getElementById('bibi')) return;
    
    // 显示加载状态
    showLoading();
    
    getBibiDataForPage()
        .then(renderBibiCards)
        .catch(error => {
            console.error('初始化唠叨页面失败:', error);
            showError();
        });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initBibiPage);
document.addEventListener('pjax:complete', initBibiPage);
window.addEventListener('resize', handleResize);