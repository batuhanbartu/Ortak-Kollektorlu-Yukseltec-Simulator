document.getElementById("dc-analysis-button").addEventListener("click", () => {
    document.querySelector(".container").scrollIntoView({
        behavior: 'smooth'
    });
    calculate();
});

function calculate() {
    // Kullanıcıdan değerleri al
    const rx = parseFloat(document.getElementById('rx').value);
    let cpi = parseFloat(document.getElementById('cpi').value);
    let cnu = parseFloat(document.getElementById('cnu').value);
    const rg = parseFloat(document.getElementById('rg').value);
    const vg = parseFloat(document.getElementById('vg').value);
    const r1 = parseFloat(document.getElementById('r1').value);
    const r2 = parseFloat(document.getElementById('r2').value);
    const re = parseFloat(document.getElementById('re').value);
    const ry = parseFloat(document.getElementById('ry').value);
    const vcc = parseFloat(document.getElementById('vcc').value);
    let c1 = parseFloat(document.getElementById('c1').value);
    let c2 = parseFloat(document.getElementById('c2').value);
    const currentUnit = document.getElementById('currentUnit').value;
    const voltageUnit = document.getElementById('voltageUnit').value;
    const frequencyUnit = document.getElementById('frequencyUnit').value;

    // Formülleri kullanarak hesaplamaları yap
    const bdc = 100;
    const rb = (r1 * r2) / (r1 + r2);
    const vb = (vcc * r2) / (r1 + r2);
    const ib = (vb - 0.7) / (101 * re + rb);
    const ic = bdc * ib;
    const ie = 101 * ib;
    const vbe = 0.7; 
    const vce = vcc - (re * ie);
    const vcb = vce - vbe;
    const gm = 38.92 * ic;
    const rpi = bdc / gm;
    // const vpi = rpi * ib;
    const kvi = (((re * ry) / (re + ry)) * (1 + bdc)) / (rpi + (((re * ry) / (re + ry)) * (1 + bdc)));
    // kvi = kvi / 1000;
    const kvi_db = 20 * Math.log10(kvi / Math.sqrt(2));
    const x = (rg * rb) / (rg + rb) + rx;
    const y = rx + (1 + bdc) * ((re * ry) / (re + ry));
    const rnü = ((x * y) / (x + y)) * ((x * y) / (x + y));
    // const z = rx + (rb * rg) / (rb + rg);
    const rz = (x + (re * ry) / (re + ry)) / ((1 + gm) * ((re * ry) / (re + ry))) / (1 + gm + (re * ry) / (re + ry));
    const Rpi = (rpi * rz) / (rpi + rz);
    const fh = 1/(2 * Math.PI * (Rpi * cpi + rnü * cnu));


    let aktif;
    if (vce > vbe) {
        aktif = "AKTİF bölgededir";
    } else if (vce < vbe) {
        aktif = "DOYUM bölgesindedir";
    } else if (vce == -vcc) {
        aktif = "KESİM bölgesindedir";
    }

    // Sonuçları birimlere göre dönüştür
    let ib_result, ic_result, ie_result, vce_result, vcb_result, vbe_result, fh_result, kvi_result, kvi_db_result;

    // Akım birimlerine göre dönüştür
    switch (currentUnit) {
        case 'A':
            ib_result = ib;
            document.getElementById('ib').innerHTML = `${ib_result} A`;
            ic_result = ic;
            document.getElementById('ic').innerHTML = `${ic_result} A`;
            ie_result = ie;
            document.getElementById('ie').innerHTML = `${ie_result} A`;
            break;
        case 'mA':
            ib_result = ib * 1e3;
            document.getElementById('ib').innerHTML = `${ib_result} mA`;
            ic_result = ic * 1e3;
            document.getElementById('ic').innerHTML = `${ic_result} mA`;
            ie_result = ie * 1e3;
            document.getElementById('ie').innerHTML = `${ie_result} mA`;
            break;
        case 'µA':
            ib_result = ib * 1e6;
            document.getElementById('ib').innerHTML = `${ib_result} µA`;
            ic_result = ic * 1e6;
            document.getElementById('ic').innerHTML = `${ic_result} µA`;
            ie_result = ie * 1e6;
            document.getElementById('ie').innerHTML = `${ie_result} µA`;
            break;
    }

    // Gerilim birimlerine göre dönüştür
    switch (voltageUnit) {
        case 'V':
            vce_result = vce;
            document.getElementById('vce').innerHTML = `${vce_result} V`;
            vcb_result = vcb;
            document.getElementById('vcb').innerHTML = `${vcb_result} V`;
            vbe_result = vbe;
            document.getElementById('vbe').innerHTML = `${vbe_result} V`;
            break;
        case 'mV':
            vce_result = vce * 1e3;
            document.getElementById('vce').innerHTML = `${vce_result} mV`;
            vcb_result = vcb * 1e3;
            document.getElementById('vcb').innerHTML = `${vcb_result} mV`;
            vbe_result = vbe * 1e3;
            document.getElementById('vbe').innerHTML = `${vbe_result} mV`;
            break;
        case 'kV':
            vce_result = vce / 1e-3;
            document.getElementById('vce').innerHTML = `${vce_result} kV`;
            vcb_result = vcb / 1e-3;
            document.getElementById('vcb').innerHTML = `${vcb_result} kV`;
            vbe_result = vbe / 1e-3;
            document.getElementById('vbe').innerHTML = `${vbe_result} kV`;
            break;
    }

    // Frekans birimlerine göre dönüştür
    switch (frequencyUnit) {
        case 'Hz':
            fh_result = fh;
            document.getElementById('fh').innerHTML = `${fh_result} Hz`;
            break;
        case 'mHz':
            fh_result = fh * 1e3;
            document.getElementById('fh').innerHTML = `${fh_result} kHz`;
            break;
        case 'µHz':
            fh_result = fh * 1e6;
            document.getElementById('fh').innerHTML = `${fh_result} MHz`;
            break;
    }
    
    // Sonuçları görüntüle

    document.getElementById('durum').innerText = aktif;
    document.getElementById('kvi').innerHTML =`${kvi.toFixed(2)} dB`;
    document.getElementById('kvi_db').innerHTML = `${kvi_db.toFixed(2)} dB`;

    const ctx = document.getElementById('graph').getContext('2d');
    const data = {
        labels: [],
        datasets: [{
            label: 'Frekans Kazanç Grafiği (dB)',
            data: [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    // Frekans ve kazanç değerlerini hesapla ve grafiğe ekle
    for (let i = 1; i <= 12; i++) {
        let frequency = i * fh * 0.1;
        const gain = kvi * Math.sqrt(1 / (1 + (frequency / fh) ** 2));
        const gain_db = 20 * Math.log10(gain);

        frequency*=1e6;
        data.labels.push(frequency.toFixed(2) + " mHz");
        data.datasets[0].data.push(gain_db.toFixed(2));
        console.log(frequency)
    }

    // Grafiği çiz
    const myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Frekans (mHz)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Kazanç (dB)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + ' dB';
                        }
                    }
                }
            }
        }
    });
}
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        calculate();
    }
});
