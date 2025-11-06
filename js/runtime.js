// 添加这个检查，避免重复声明
if (typeof TimeTracker === 'undefined') {
  class TimeTracker {
    constructor() {
      this.startDate = new Date("2021-08-09T00:00:00"); // 网站开始时间
      this.voyagerLaunchDate = new Date("1977-09-05T00:00:00"); // 旅行者1号发射时间
      this.voyagerStartDistance = 23400000000; // 23.4亿公里初始距离
      this.voyagerSpeed = 17; // 17km/s
      this.astronomicalUnit = 149600000; // 1天文单位(km)
      
      this.init();
    }

    init() {
      this.updateTime();
      setInterval(() => this.updateTime(), 1000);
    }

    formatTimeUnit(value) {
      return String(value).padStart(2, '0');
    }

    // 计算旅行者1号飞行时间
    calculateVoyagerFlightTime() {
      const now = new Date();
      const totalSeconds = Math.floor((now - this.voyagerLaunchDate) / 1000);
      
      const years = Math.floor(totalSeconds / 31536000); // 365 * 24 * 60 * 60
      const days = Math.floor((totalSeconds % 31536000) / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return {
        years,
        days: this.formatTimeUnit(days),
        hours: this.formatTimeUnit(hours),
        minutes: this.formatTimeUnit(minutes),
        seconds: this.formatTimeUnit(seconds)
      };
    }

    calculateVoyagerDistance() {
      const now = new Date();
      const elapsedSeconds = (now - this.voyagerLaunchDate) / 1000;
      return this.voyagerStartDistance + (elapsedSeconds * this.voyagerSpeed);
    }

    calculateRunTime() {
      const now = new Date();
      const totalSeconds = Math.floor((now - this.startDate) / 1000);
      
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return {
        days,
        hours: this.formatTimeUnit(hours),
        minutes: this.formatTimeUnit(minutes),
        seconds: this.formatTimeUnit(seconds)
      };
    }

    getTimeStatus(hours) {
      const isWorkingHours = hours >= 9 && hours < 18;
      
      return {
        badge: isWorkingHours ? 
          'https://img.shields.io/badge/🛠️-工作中-blue' :
          'https://img.shields.io/badge/🌙-休息中-purple',
        title: isWorkingHours ? 
          '什么时候能够实现财富自由呀~' : 
          '下班了就该开开心心地玩耍~'
      };
    }

    updateTime() {
      const runTime = this.calculateRunTime();
      const voyagerFlightTime = this.calculateVoyagerFlightTime();
      const distance = this.calculateVoyagerDistance();
      const astronomicalUnits = (distance / this.astronomicalUnit).toFixed(6);
      
      const currentHour = new Date().getHours();
      const status = this.getTimeStatus(currentHour);

      const timeHtml = `
        <div style="text-align: center;">
          <img class='boardsign' src='${status.badge}' title='${status.title}' style="display: block; margin: 0 auto;">
          <br>
          <div style="font-size:13px;font-weight:bold; text-align: center;">
            本站居然运行了 ${runTime.days} 天 ${runTime.hours} 小时 ${runTime.minutes} 分 ${runTime.seconds} 秒 
            <i id="heartbeat" class='fas fa-heartbeat'></i>
            <br>
            旅行者 1 号已飞行 ${voyagerFlightTime.years} 年 ${voyagerFlightTime.days} 天 ${voyagerFlightTime.hours} 小时 ${voyagerFlightTime.minutes} 分 ${voyagerFlightTime.seconds} 秒
            <br>
            当前距离地球 ${Math.trunc(distance).toLocaleString()} 千米，约为 ${astronomicalUnits} 个天文单位 🚀
          </div>
        </div>
      `;

      const workboard = document.getElementById("workboard");
      if (workboard) {
        workboard.innerHTML = timeHtml;
      }
    }
  }

  // 初始化
  new TimeTracker();
}