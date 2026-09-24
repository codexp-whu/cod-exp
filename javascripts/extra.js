(function () {
    // 加载 GoatCounter 统计脚本
    const script = document.createElement("script");

    script.dataset.goatcounter =
        "https://codexp-whu.goatcounter.com/count";

    script.async = true;
    script.src = "https://gc.zgo.at/count.js";

    document.head.appendChild(script);

    // 显示累计访问量
    fetch(
        "https://codexp-whu.goatcounter.com/counter/TOTAL.json"
    )
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            const counter =
                document.querySelector("#visitor-count");

            if (counter) {
                counter.textContent = data.count;
            }
        })
        .catch(error => {
            console.error(
                "GoatCounter counter error:",
                error
            );
        });
})();