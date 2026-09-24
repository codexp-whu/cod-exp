(function () {
    // =========================
    // 1. 加载 GoatCounter
    // =========================
    const script = document.createElement("script");

    script.setAttribute(
        "data-goatcounter",
        "https://codexp-whu.goatcounter.com/count"
    );

    script.async = true;
    script.src = "https://gc.zgo.at/count.js";

    document.head.appendChild(script);


    // =========================
    // 2. 获取累计访问量
    // =========================
    fetch(
        "https://codexp-whu.goatcounter.com/counter/TOTAL.json"
    )
        .then(response => response.json())
        .then(data => {
            const el = document.querySelector("#visitor-count");

            if (el) {
                el.textContent = data.count;
            }
        })
        .catch(error => {
            console.error(
                "GoatCounter counter error:",
                error
            );
        });
})();