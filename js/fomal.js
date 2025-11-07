/* 阅读进度 start */
document.addEventListener('pjax:complete', function () {
  window.onscroll = percent;
});
document.addEventListener('DOMContentLoaded', function () {
  window.onscroll = percent;
});
// 页面百分比
function percent() {

  // 先让菜单栏消失
  try {
    rmf.showRightMenu(false);
    $('.rmMask').attr('style', 'display: none');
  } catch (err) {

  }

  let a = document.documentElement.scrollTop, // 卷去高度
    b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - document.documentElement.clientHeight, // 整个网页高度 减去 可视高度
    result = Math.round(a / b * 100), // 计算百分比
    btn = document.querySelector("#go-up"); // 获取按钮

  if (result < 95) { // 如果阅读进度小于95% 就显示百分比
    btn.childNodes[0].style.display = 'none'
    btn.childNodes[1].style.display = 'block'
    btn.childNodes[1].innerHTML = result + '<span>%</span>';
  } else { // 如果大于95%就显示回到顶部图标
    btn.childNodes[1].style.display = 'none'
    btn.childNodes[0].style.display = 'block'
  }
}
/* 阅读进度 end */

//----------------------------------------------------------------

//----------------------------------------------------------------

/* 欢迎信息 start - 使用 nsmao.net IP查询API (带缓存功能) */
let ipLoacation = {}; // 存储IP位置信息

// 缓存配置
const CACHE_CONFIG = {
  KEY: 'ip_geolocation_cache',
  EXPIRY: 30 * 60 * 1000, // 30分钟缓存
  ENABLED: true
};

// 您的坐标
const MY_COORDINATES = {
  lng: 103.88720,
  lat: 30.81050
};

// 缓存管理函数
const cacheManager = {
  set: function(data) {
    if (!CACHE_CONFIG.ENABLED) return;
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expiry: CACHE_CONFIG.EXPIRY
      };
      localStorage.setItem(CACHE_CONFIG.KEY, JSON.stringify(cacheData));
      console.log('IP位置信息已缓存');
    } catch (error) {
      console.warn('缓存保存失败:', error);
    }
  },
  
  get: function() {
    if (!CACHE_CONFIG.ENABLED) return null;
    try {
      const cached = localStorage.getItem(CACHE_CONFIG.KEY);
      if (!cached) return null;
      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > cacheData.expiry;
      if (isExpired) {
        this.clear();
        return null;
      }
      console.log('从缓存中读取IP位置信息');
      return cacheData.data;
    } catch (error) {
      console.warn('缓存读取失败:', error);
      return null;
    }
  },
  
  clear: function() {
    try {
      localStorage.removeItem(CACHE_CONFIG.KEY);
      console.log('缓存已清除');
    } catch (error) {
      console.warn('缓存清除失败:', error);
    }
  }
};

// 使用 nsmao.net API 获取IP和位置信息
function fetchIPGeolocation(forceRefresh = false) {
  return new Promise((resolve) => {
    // 检查缓存（除非强制刷新）
    if (!forceRefresh) {
      const cachedData = cacheManager.get();
      if (cachedData) {
        ipLoacation = cachedData;
        resolve(ipLoacation);
        return;
      }
    }
    
    // 使用 nsmao.net API
    $.ajax({
      url: 'https://api.nsmao.net/api/ipip/query',
      data: {
        key: 'HQWiSAht2dHWQlbItCcVVCBVJG'
      },
      type: 'GET',
      dataType: 'json',
      timeout: 3000,
      success: function(response) {
        console.log('IP查询API返回数据:', response);
        
        // 根据实际的API返回数据结构进行适配
        if (response && response.code === 200) {
          ipLoacation = {
            result: {
              ip: response.ip || response.data.ip || "未知IP",
              location: {
                lng: parseFloat(response.data.lng) || 0,
                lat: parseFloat(response.data.lat) || 0
              },
              ad_info: {
                nation: response.data.country || "中国",
                province: response.data.province || "",
                city: response.data.city || "",
                district: "",
                isp: response.data.isp || ""
              }
            },
            _meta: {
              source: 'nsmao',
              cached: false,
              timestamp: Date.now()
            }
          };
        } else {
          throw new Error(response?.msg || 'API返回数据异常');
        }
        
        console.log('IP地理位置信息获取成功:', ipLoacation);
        cacheManager.set(ipLoacation);
        resolve(ipLoacation);
      },
      error: function(xhr, status, error) {
        console.error('获取IP地理位置失败:', error);
        
        // 尝试使用缓存（即使过期）
        const cachedData = cacheManager.get();
        if (cachedData) {
          console.log('API请求失败，使用过期的缓存数据');
          ipLoacation = cachedData;
          ipLoacation._meta = {
            source: 'cache_expired',
            cached: true,
            timestamp: Date.now()
          };
          resolve(ipLoacation);
          return;
        }
        
        // 使用默认位置信息
        resolve(setDefaultLocation());
      }
    });
  });
}

// 设置默认位置信息
function setDefaultLocation() {
  ipLoacation = {
    result: {
      ip: "未知IP",
      location: {
        lng: MY_COORDINATES.lng,
        lat: MY_COORDINATES.lat
      },
      ad_info: {
        nation: "中国",
        province: "四川",
        city: "成都",
        district: "",
        isp: ""
      }
    },
    _meta: {
      source: 'default',
      cached: false,
      timestamp: Date.now()
    }
  };
  return ipLoacation;
}

// 计算距离函数
function getDistance(visitorLng, visitorLat) {
  const R = 6371;
  const { sin, cos, asin, PI, sqrt } = Math;
  
  const toRadians = (degree) => degree * PI / 180;
  
  const lat1 = toRadians(MY_COORDINATES.lat);
  const lon1 = toRadians(MY_COORDINATES.lng);
  const lat2 = toRadians(visitorLat);
  const lon2 = toRadians(visitorLng);
  
  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;
  
  const a = sin(dlat/2) * sin(dlat/2) +
            cos(lat1) * cos(lat2) *
            sin(dlon/2) * sin(dlon/2);
  
  const c = 2 * asin(sqrt(a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100;
}

// 生成位置描述
function generatePosDesc(dist, locationData) {
  if (!locationData) return "欢迎访问！";
  
  const nation = locationData.ad_info.nation;
  const city = locationData.ad_info.city;
  const province = locationData.ad_info.province;
  const isp = locationData.ad_info.isp;
  
  let desc = "";
  
  if (dist === 0) {
    desc = "您就在我的位置！真是太巧了！";
  } else if (dist < 1) {
    desc = "您就在附近，真是太巧了！";
  } else if (dist < 10) {
    desc = "我们离得很近哦！";
  } else if (dist < 50) {
    desc = "欢迎附近的朋友！";    
  } else if (dist < 500) {
    desc = "欢迎来自省内的朋友！";
  } else if (nation === "中国") {
    desc = "欢迎来自远方的国内朋友！";
  } else {
    desc = "有朋自远方来，不亦乐乎！";
  }
  
  
  return desc;
}

// 显示欢迎信息
async function showWelcome(forceRefresh = false) {
  let dist, pos, ip, posdesc, sourceInfo = '';

  try {
    // 获取IP位置信息
    await fetchIPGeolocation(forceRefresh);
    
    // 显示数据来源信息
    if (ipLoacation._meta) {
      const sources = {
        'nsmao': 'IP查询API',
        'cache': '缓存',
        'cache_expired': '过期缓存',
        'default': '默认数据'
      };
      sourceInfo = `（数据来源: ${sources[ipLoacation._meta.source] || ipLoacation._meta.source}）`;
    }

    if (ipLoacation.result && ipLoacation.result.ad_info) {
      const loc = ipLoacation.result;
      
      // 计算距离
      if (loc.location.lat && loc.location.lng) {
        dist = getDistance(loc.location.lng, loc.location.lat);
      } else {
        dist = 0;
      }
      
      // 国内位置显示优化：优先显示城市
      const city = loc.ad_info.city;
      const province = loc.ad_info.province;
      
      if (city && province) {
        // 如果省市相同（如直辖市），只显示城市
        if (province.replace(/省|市/g, '') === city.replace(/市/g, '')) {
          pos = city;
        } else {
          pos = city; // 国内只显示城市
        }
      } else if (city) {
        pos = city;
      } else if (province) {
        pos = province;
      } else {
        pos = "中国";
      }
      
      ip = loc.ip;
      posdesc = generatePosDesc(dist, loc);
    } else {
      throw new Error("IP位置数据不完整");
    }
  } catch (error) {
    console.error("显示欢迎信息时出错:", error);
    dist = 0;
    pos = "成都";
    ip = "未知IP";
    posdesc = "欢迎访问！";
  }

  // 根据本地时间切换欢迎语
  let timeChange;
  let date = new Date();
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 11) timeChange = "<span>上午好</span>，一日之计在于晨！";
  else if (hour >= 11 && hour < 13) timeChange = "<span>中午好</span>，该摸鱼吃午饭了。";
  else if (hour >= 13 && hour < 15) timeChange = "<span>下午好</span>，懒懒地睡个午觉吧！";
  else if (hour >= 15 && hour < 17) timeChange = "<span>下午好</span>，一起饮茶呀！";
  else if (hour >= 17 && hour < 19) timeChange = "<span>傍晚好</span>，夕阳无限好！";
  else if (hour >= 19 && hour < 24) timeChange = "<span>晚上好</span>，夜生活嗨起来！";
  else timeChange = "夜深了，早点休息，少熬夜。";

  try {
    document.getElementById("welcome-info").innerHTML =
      `<b><center>🎉 欢迎信息 🎉</center>&emsp;&emsp;来自 <span style="color:var(--theme-color)">${pos}</span> 的小伙伴，${timeChange}您现在距离站长约 <span style="color:var(--theme-color)">${dist}</span> 公里，当前的IP地址为： <span style="color:var(--theme-color)">${ip}</span>， ${posdesc}</b>`;
  } catch (err) {
    console.log("无法获取#welcome-info元素");
  }
}

// 手动刷新位置信息
function refreshLocation() {
  console.log('手动刷新位置信息...');
  showWelcome(true);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
  showWelcome();
});

// 如果使用了pjax
document.addEventListener('pjax:complete', function() {
  showWelcome();
});

// 调试功能
window.getCacheInfo = function() {
  const cached = cacheManager.get();
  return cached ? {
    exists: true,
    city: cached.result?.ad_info?.city,
    country: cached.result?.ad_info?.nation,
    ip: cached.result?.ip
  } : { exists: false };
};

window.clearLocationCache = function() {
  cacheManager.clear();
  console.log('位置缓存已清除');
  return '缓存已清除';
};

/* 欢迎信息 end */


/* 禁用f12与按键防抖 start */
// 防抖全局计时器
let TT = null;    //time用来控制事件的触发
// 防抖函数:fn->逻辑 time->防抖时间
function debounce(fn, time) {
  if (TT !== null) clearTimeout(TT);
  TT = setTimeout(fn, time);
}

// 复制提醒
document.addEventListener("copy", function () {
  debounce(function () {
    new Vue({
      data: function () {
        this.$notify({
          title: "哎嘿！复制成功🍬",
          message: "若要转载最好保留原文链接哦，给你一个大大的赞！",
          position: 'top-left',
          offset: 50,
          showClose: true,
          type: "success",
          duration: 5000
        });
      }
    })
  }, 300);
})


// f12提醒但不禁用
document.onkeydown = function (e) {
  if (123 == e.keyCode || (e.ctrlKey && e.shiftKey && (74 === e.keyCode || 73 === e.keyCode || 67 === e.keyCode)) || (e.ctrlKey && 85 === e.keyCode)) {
    debounce(function () {
      new Vue({
        data: function () {
          this.$notify({
            title: "你已被发现😜",
            message: "小伙子，扒源记住要遵循GPL协议！",
            position: 'top-left',
            offset: 50,
            showClose: true,
            type: "warning",
            duration: 5000
          });
        }
      })
    }, 300);
  }
};
/* 禁用f12与按键防抖 end */

//----------------------------------------------------------------

/* 雪花特效 start */
if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
  // 移动端不显示
} else {
  // document.write('<canvas id="snow" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;pointer-events:none"></canvas>');

  window && (() => {
    let e = {
      flakeCount: 50, // 雪花数目
      minDist: 150,   // 最小距离
      color: "255, 255, 255", // 雪花颜色
      size: 1.5,  // 雪花大小
      speed: .5,  // 雪花速度
      opacity: .7,    // 雪花透明度
      stepsize: .5    // 步距
    };
    const t = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (e) {
      window.setTimeout(e, 1e3 / 60)
    }
      ;
    window.requestAnimationFrame = t;
    const i = document.getElementById("snow"),
      n = i.getContext("2d"),
      o = e.flakeCount;
    let a = -100,
      d = -100,
      s = [];
    i.width = window.innerWidth,
      i.height = window.innerHeight;
    const h = () => {
      n.clearRect(0, 0, i.width, i.height);
      const r = e.minDist;
      for (let t = 0; t < o; t++) {
        let o = s[t];
        const h = a,
          w = d,
          m = o.x,
          c = o.y,
          p = Math.sqrt((h - m) * (h - m) + (w - c) * (w - c));
        if (p < r) {
          const e = (h - m) / p,
            t = (w - c) / p,
            i = r / (p * p) / 2;
          o.velX -= i * e,
            o.velY -= i * t
        } else
          o.velX *= .98,
            o.velY < o.speed && o.speed - o.velY > .01 && (o.velY += .01 * (o.speed - o.velY)),
            o.velX += Math.cos(o.step += .05) * o.stepSize;
        n.fillStyle = "rgba(" + e.color + ", " + o.opacity + ")",
          o.y += o.velY,
          o.x += o.velX,
          (o.y >= i.height || o.y <= 0) && l(o),
          (o.x >= i.width || o.x <= 0) && l(o),
          n.beginPath(),
          n.arc(o.x, o.y, o.size, 0, 2 * Math.PI),
          n.fill()
      }
      t(h)
    }
      , l = e => {
        e.x = Math.floor(Math.random() * i.width),
          e.y = 0,
          e.size = 3 * Math.random() + 2,
          e.speed = 1 * Math.random() + .5,
          e.velY = e.speed,
          e.velX = 0,
          e.opacity = .5 * Math.random() + .3
      }
      ;
    document.addEventListener("mousemove", (e => {
      a = e.clientX,
        d = e.clientY
    }
    )),
      window.addEventListener("resize", (() => {
        i.width = window.innerWidth,
          i.height = window.innerHeight
      }
      )),
      (() => {
        for (let t = 0; t < o; t++) {
          const t = Math.floor(Math.random() * i.width)
            , n = Math.floor(Math.random() * i.height)
            , o = 3 * Math.random() + e.size
            , a = 1 * Math.random() + e.speed
            , d = .5 * Math.random() + e.opacity;
          s.push({
            speed: a,
            velX: 0,
            velY: a,
            x: t,
            y: n,
            size: o,
            stepSize: Math.random() / 30 * e.stepsize,
            step: 0,
            angle: 180,
            opacity: d
          })
        }
        h()
      }
      )()
  }
  )();
}

/* 雪花特效 end */

//----------------------------------------------------------------


/* 表情放大 start */
document.addEventListener('pjax:complete', function () {
  if (document.getElementById('post-comment')) owoBig();
});
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('post-comment')) owoBig();
});

// 表情放大
function owoBig() {
  let flag = 1, // 设置节流阀
    owo_time = '', // 设置计时器
    m = 3; // 设置放大倍数
  // 创建盒子
  let div = document.createElement('div'),
    body = document.querySelector('body');
  // 设置ID
  div.id = 'owo-big';
  // 插入盒子
  body.appendChild(div)

  // 构造observer
  let observer = new MutationObserver(mutations => {

    for (let i = 0; i < mutations.length; i++) {
      let dom = mutations[i].addedNodes,
        owo_body = '';
      if (dom.length == 2 && dom[1].className == 'OwO-body') owo_body = dom[1];
      // 如果需要在评论内容中启用此功能请解除下面的注释
      // else if (dom.length == 1 && dom[0].className == 'tk-comment') owo_body = dom[0];
      else continue;

      // 禁用右键（手机端长按会出现右键菜单，为了体验给禁用掉）
      if (document.body.clientWidth <= 768) owo_body.addEventListener('contextmenu', e => e.preventDefault());
      // 鼠标移入
      owo_body.onmouseover = (e) => {
        if (flag && e.target.tagName == 'IMG') {
          flag = 0;
          // 移入300毫秒后显示盒子
          owo_time = setTimeout(() => {
            let height = e.path[0].clientHeight * m, // 盒子高
              width = e.path[0].clientWidth * m, // 盒子宽
              left = (e.x - e.offsetX) - (width - e.path[0].clientWidth) / 2, // 盒子与屏幕左边距离
              top = e.y - e.offsetY; // 盒子与屏幕顶部距离

            if ((left + width) > body.clientWidth) left -= ((left + width) - body.clientWidth + 10); // 右边缘检测，防止超出屏幕
            if (left < 0) left = 10; // 左边缘检测，防止超出屏幕
            // 设置盒子样式
            div.style.cssText = `display:flex; height:${height}px; width:${width}px; left:${left}px; top:${top}px;`;
            // 在盒子中插入图片
            div.innerHTML = `<img src="${e.target.src}">`
          }, 300);
        }
      };
      // 鼠标移出隐藏盒子
      owo_body.onmouseout = () => { div.style.display = 'none', flag = 1, clearTimeout(owo_time); }
    }

  })
  observer.observe(document.getElementById('post-comment'), { subtree: true, childList: true })
}
/* 表情放大 end */

//----------------------------------------------------------------

/* 随便逛逛 start */
// 随便逛逛
// 发现有时会和当前页面重复，加一个判断
function randomPost() {
  fetch('/baidusitemap.xml').then(res => res.text()).then(str => (new window.DOMParser()).parseFromString(str, "text/xml")).then(data => {
    let ls = data.querySelectorAll('url loc');
    while (true) {
      let url = ls[Math.floor(Math.random() * ls.length)].innerHTML;
      if (location.href == url) continue;
      location.href = url;
      return;
    }
  })
}
/* 随便逛逛 end */

//----------------------------------------------------------------

/* 控制台输出字符画 start */
var now1 = new Date();

function createtime1() {
  var grt = new Date("08/09/2021 00:00:00"); //此处修改你的建站时间或者网站上线时间
  now1.setTime(now1.getTime() + 250);
  var days = (now1 - grt) / 1000 / 60 / 60 / 24;
  var dnum = Math.floor(days);

  var ascll = [
    `欢迎来到玖玖の小窝!`,
    `一些关于玖玖的琐事🍋‍🟩`,
    `

      _ _           _ _       
     | (_)_   _    | (_)_   _ 
  _  | | | | | |_  | | | | | |
 | |_| | | |_| | |_| | | |_| |
  \___/|_|\__,_|\___/|_|\__,_|_|
                              
                               
                                              
`,
    "小站已经苟活",
    dnum,
    "天啦!",
    "©2021 By Fomalhaut",
  ];

  setTimeout(
    console.log.bind(
      console,
      `\n%c${ascll[0]} %c ${ascll[1]} %c ${ascll[2]} %c${ascll[3]}%c ${ascll[4]}%c ${ascll[5]}\n\n%c ${ascll[6]}\n`,
      "color:#39c5bb",
      "",
      "color:#39c5bb",
      "color:#39c5bb",
      "",
      "color:#39c5bb",
      ""
    )
  );
}

createtime1();

function createtime2() {
  var ascll2 = [`NCC2-036`, `调用前置摄像头拍照成功，识别为「大聪明」`, `Photo captured: `, ` 🤪 `];

  setTimeout(
    console.log.bind(
      console,
      `%c ${ascll2[0]} %c ${ascll2[1]} %c \n${ascll2[2]} %c\n${ascll2[3]}`,
      "color:white; background-color:#10bcc0",
      "",
      "",
      'background:url("https://unpkg.zhimg.com/anzhiyu-assets@latest/image/common/tinggge.gif") no-repeat;font-size:450%'
    )
  );

  setTimeout(console.log.bind(console, "%c WELCOME %c 欢迎光临，大聪明", "color:white; background-color:#23c682", ""));

  setTimeout(
    console.warn.bind(
      console,
      "%c ⚡ Powered by 🍋‍🟩 %c 你正在访问玖玖🍋‍🟩の小窝",
      "color:white; background-color:#f0ad4e",
      ""
    )
  );

  setTimeout(console.log.bind(console, "%c W23-12 %c 系统监测到你已打开控制台", "color:white; background-color:#4f90d9", ""));
  setTimeout(
    console.warn.bind(console, "%c S013-782 %c 你现在正处于监控中", "color:white; background-color:#d9534f", "")
  );
}
createtime2();

// 重写console方法
console.log = function () { };
console.error = function () { };
console.warn = function () { };

/* 控制台输出字符画 end */

//----------------------------------------------------------------

/* 夜间模式切换动画 start */
function switchNightMode() {
  document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="Cuteen_DarkSky"><div class="Cuteen_DarkPlanet"><div id="sun"></div><div id="moon"></div></div></div>'),
    setTimeout(function () {
      document.querySelector('body').classList.contains('DarkMode') ? (document.querySelector('body').classList.remove('DarkMode'), localStorage.setItem('isDark', '0'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-moon')) : (document.querySelector('body').classList.add('DarkMode'), localStorage.setItem('isDark', '1'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-sun')),
        setTimeout(function () {
          document.getElementsByClassName('Cuteen_DarkSky')[0].style.transition = 'opacity 3s';
          document.getElementsByClassName('Cuteen_DarkSky')[0].style.opacity = '0';
          setTimeout(function () {
            document.getElementsByClassName('Cuteen_DarkSky')[0].remove();
          }, 1e3);
        }, 2e3)
    })
  const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  if (nowMode === 'light') {
    // 先设置太阳月亮透明度
    document.getElementById("sun").style.opacity = "1";
    document.getElementById("moon").style.opacity = "0";
    setTimeout(function () {
      document.getElementById("sun").style.opacity = "0";
      document.getElementById("moon").style.opacity = "1";
    }, 1000);

    activateDarkMode()
    saveToLocal.set('theme', 'dark', 2)
    // GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
    document.getElementById('modeicon').setAttribute('xlink:href', '#icon-sun')
    // 延时弹窗提醒
    setTimeout(() => {
      new Vue({
        data: function () {
          this.$notify({
            title: "关灯啦🌙",
            message: "当前已成功切换至夜间模式！",
            position: 'top-left',
            offset: 50,
            showClose: true,
            type: "success",
            duration: 5000
          });
        }
      })
    }, 2000)
  } else {
    // 先设置太阳月亮透明度
    document.getElementById("sun").style.opacity = "0";
    document.getElementById("moon").style.opacity = "1";
    setTimeout(function () {
      document.getElementById("sun").style.opacity = "1";
      document.getElementById("moon").style.opacity = "0";
    }, 1000);

    activateLightMode()
    saveToLocal.set('theme', 'light', 2)
    document.querySelector('body').classList.add('DarkMode'), document.getElementById('modeicon').setAttribute('xlink:href', '#icon-moon')
    setTimeout(() => {
      new Vue({
        data: function () {
          this.$notify({
            title: "开灯啦🌞",
            message: "当前已成功切换至白天模式！",
            position: 'top-left',
            offset: 50,
            showClose: true,
            type: "success",
            duration: 5000
          });
        }
      })
    }, 2000)
  }
  // handle some cases
  typeof utterancesTheme === 'function' && utterancesTheme()
  typeof FB === 'object' && window.loadFBComment()
  window.DISQUS && document.getElementById('disqus_thread').children.length && setTimeout(() => window.disqusReset(), 200)
}

/* 夜间模式切换动画 end */

//----------------------------------------------------------------

/* 分享按钮 start */
// 分享本页
function share_() {
  let url = window.location.origin + window.location.pathname
  try {
    // 截取标题
    var title = document.title;
    var subTitle = title.endsWith("| Fomalhaut🥝") ? title.substring(0, title.length - 14) : title;
    navigator.clipboard.writeText('Fomalhaut🥝的站内分享\n标题：' + subTitle + '\n链接：' + url + '\n欢迎来访！🍭🍭🍭');
    new Vue({
      data: function () {
        this.$notify({
          title: "成功复制分享信息🎉",
          message: "您现在可以通过粘贴直接跟小伙伴分享了！",
          position: 'top-left',
          offset: 50,
          showClose: true,
          type: "success",
          duration: 5000
        });
        // return { visible: false }
      }
    })
  } catch (err) {
    console.error('复制失败！', err);
  }
  // new ClipboardJS(".share", { text: function () { return '标题：' + document.title + '\n链接：' + url } });
  // btf.snackbarShow("本页链接已复制到剪切板，快去分享吧~")
}

// 防抖
function share() {
  debounce(share_, 300);
}

/* 分享按钮 end */

//----------------------------------------------------------------

/* 恶搞标题 start */
//动态标题
var OriginTitile = document.title;
var titleTime;
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    //离开当前页面时标签显示内容
    document.title = '🍛 饭点到了吗？';
    clearTimeout(titleTime);
  } else {
    //返回当前页面时标签显示内容
    document.title = '🍨 带冰淇淋回来了吗～';
    //两秒后变回正常标题
    titleTime = setTimeout(function () {
      document.title = OriginTitile;
    }, 2000);
  }
});
/* 恶搞标题 end */

//----------------------------------------------------------------

//----------------------------------------------------------------

/* 听话鼠标 start */
var CURSOR;

Math.lerp = (a, b, n) => (1 - n) * a + n * b;

const getStyle2 = (el, attr) => {
  try {
    return window.getComputedStyle
      ? window.getComputedStyle(el)[attr]
      : el.currentStyle[attr];
  } catch (e) { }
  return "";
};

// 为了屏蔽异步加载导致无法读取颜色值，这里统一用哈希表预处理
const map = new Map();
map.set('red', "rgb(241, 71, 71)");
map.set('orange', "rgb(241, 162, 71)");
map.set('yellow', "rgb(241, 238, 71)")
map.set('purple', "rgb(179, 71, 241)");
map.set('blue', "rgb(102, 204, 255)");
map.set('gray', "rgb(226, 226, 226)");
map.set('green', "rgb(57, 197, 187)");
map.set('whitegray', "rgb(241, 241, 241)");
map.set('pink', "rgb(237, 112, 155)");
map.set('black', "rgb(0, 0, 0)");
map.set('darkblue', "rgb(97, 100, 159)");
map.set('heoblue', "rgb(66, 90, 239)");

class Cursor {
  constructor() {
    this.pos = { curr: null, prev: null };
    this.pt = [];
    this.create();
    this.init();
    this.render();
  }

  move(left, top) {
    this.cursor.style["left"] = `${left}px`;
    this.cursor.style["top"] = `${top}px`;
  }

  create() {
    if (!this.cursor) {
      this.cursor = document.createElement("div");
      this.cursor.id = "cursor";
      this.cursor.classList.add("hidden");
      document.body.append(this.cursor);
    }
    var el = document.getElementsByTagName('*');
    for (let i = 0; i < el.length; i++)
      if (getStyle2(el[i], "cursor") == "pointer")
        this.pt.push(el[i].outerHTML);
    var colorVal = map.get(localStorage.getItem("themeColor"));
    document.body.appendChild((this.scr = document.createElement("style")));
    this.scr.innerHTML = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8px' height='8px'><circle cx='4' cy='4' r='4' opacity='1.0' fill='` + colorVal + `'/></svg>") 4 4, auto}`;
  }

  refresh() {
    this.scr.remove();
    this.cursor.classList.remove("hover");
    this.cursor.classList.remove("active");
    this.pos = { curr: null, prev: null };
    this.pt = [];

    this.create();
    this.init();
    this.render();
  }

  init() {
    document.onmouseover = e => this.pt.includes(e.target.outerHTML) && this.cursor.classList.add("hover");
    document.onmouseout = e => this.pt.includes(e.target.outerHTML) && this.cursor.classList.remove("hover");
    document.onmousemove = e => { (this.pos.curr == null) && this.move(e.clientX - 8, e.clientY - 8); this.pos.curr = { x: e.clientX - 8, y: e.clientY - 8 }; this.cursor.classList.remove("hidden"); };
    document.onmouseenter = e => this.cursor.classList.remove("hidden");
    document.onmouseleave = e => this.cursor.classList.add("hidden");
    document.onmousedown = e => this.cursor.classList.add("active");
    document.onmouseup = e => this.cursor.classList.remove("active");
  }

  render() {
    if (this.pos.prev) {
      // 跟踪速度调节
      this.pos.prev.x = Math.lerp(this.pos.prev.x, this.pos.curr.x, 0.15);
      this.pos.prev.y = Math.lerp(this.pos.prev.y, this.pos.curr.y, 0.15);
      this.move(this.pos.prev.x, this.pos.prev.y);
    } else {
      this.pos.prev = this.pos.curr;
    }
    requestAnimationFrame(() => this.render());
  }
}

(() => {
  CURSOR = new Cursor();
  // 需要重新获取列表时，使用 CURSOR.refresh()
})();

/* 听话鼠标 end */

//----------------------------------------------------------------
