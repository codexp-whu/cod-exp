(function () {
    console.log("extra.js loaded");

    // 加载 GoatCounter 统计脚本
    const script = document.createElement("script");

    script.dataset.goatcounter =
        "https://codexp-whu.goatcounter.com/count";

    script.async = true;
    script.src = "https://gc.zgo.at/count.js";

    script.onload = function () {
        console.log("GoatCounter count.js loaded");
    };

    script.onerror = function (error) {
        console.error("GoatCounter count.js FAILED:", error);
    };

    document.head.appendChild(script);

    // 显示累计访问量
    fetch(
        "https://codexp-whu.goatcounter.com/counter/TOTAL.json"
    )
        .then(response => {
            console.log("GoatCounter status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            console.log("GoatCounter data:", data);

            const counter =
                document.querySelector("#visitor-count");

            console.log("visitor element:", counter);

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