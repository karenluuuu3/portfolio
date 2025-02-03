document.addEventListener("DOMContentLoaded", function() {
  const menuIcon = document.querySelector(".menu-icon");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const closeBtn = document.querySelector(".close-btn");



  // 打開選單
  menuIcon.addEventListener('click', function(event) {
    event.stopPropagation(); // 阻止事件冒泡
    dropdownMenu.classList.add('show'); // 顯示選單
    menuIcon.classList.add('hide'); // 隱藏三個點
  });

  // 關閉選單
  closeBtn.addEventListener('click', function(event) {
    event.stopPropagation(); // 阻止事件冒泡
    dropdownMenu.classList.remove('show'); // 隱藏選單
    // 等待動畫完成後再顯示三個點
    setTimeout(function() {
        menuIcon.classList.remove('hide'); // 顯示三個點
    }, 400); // 與過渡時間相同，確保選單動畫完成後顯示三個點
  });

  // 點擊頁面其他地方時關閉選單
  document.addEventListener('click', function(event) {
    // 如果點擊到選單或菜單按鈕，則不執行關閉選單的動作
    if (!dropdownMenu.contains(event.target) && !menuIcon.contains(event.target)) {
        dropdownMenu.classList.remove('show'); // 隱藏選單
        // 等待動畫完成後再顯示三個點
        setTimeout(function() {
            menuIcon.classList.remove('hide'); // 顯示三個點
        }, 400); // 與過渡時間相同，確保選單動畫完成後顯示三個點
    }
  });

  // 獲取按鈕元素
  const toTopBtn = document.getElementById('toTopBtn');

  // 當使用者滾動時顯示按鈕
  window.onscroll = function() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      toTopBtn.style.display = "block";
    } else {
      toTopBtn.style.display = "none";
    }
  };

  // 點擊按鈕時返回頁面頂部
  toTopBtn.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };




});

// cursor球球
const cursor = document.querySelector('.cursor');
const mousePos = { x: 0, y: 0 };
const delay = 0.05; // 控制延遲的係數，可以根據需求調整

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

window.addEventListener('mousemove', (e) => {
    // 更新目標位置
    targetX = e.clientX;
    targetY = e.clientY;
});

// 使用 requestAnimationFrame 來平滑移動
function updateCursor() {
    // 使用線性插值來平滑過渡
    currentX += (targetX - currentX) * delay;
    currentY += (targetY - currentY) * delay;

    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;

    // 繼續更新游標位置
    requestAnimationFrame(updateCursor);
}

// 開始更新游標位置
updateCursor();




// 切換頁面
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
});

window.addEventListener('beforeunload', () => {
  document.body.style.transition = 'opacity 1s ease-in-out';
  document.body.style.opacity = 0;
});




const video = document.getElementById('video');

video.addEventListener('mouseover', () => {
  video.currentTime = 0; // 將影片重設到起始位置
  video.play(); // 播放影片
});



