fetch("https://codexp-whu.goatcounter.com/counter/TOTAL.json")
    .then(response => response.json())
    .then(data => {
        const el = document.querySelector("#visitor-count");

        if (el) {
            el.textContent = data.count;
        }
    })
    .catch(error => {
        console.error("无法获取访问量:", error);
    });