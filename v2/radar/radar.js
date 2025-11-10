
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Radar extends EventTarget {
    constructor() {
        super();
        this.seqStart = [0xF4, 0xF3, 0xF2, 0xF1];
        this.seqStop = [0xF8, 0xF7, 0xF6, 0xF5];

        this.data = [];
        this.connected = false
        this.port = null;
    }
    async connect() {
        if (this.connected) {
            console.warn("Already connected");
            return;
        }

        try {
            this.port = await navigator.serial.requestPort();
            await port.open({ baudRate: 115200 });
            this.connected = true;
            this.readLoop();
        } catch (e) {
            console.error("Error requesting or opening serial port:", e);
        }
    }
    async readLoop() {
        while (port.readable) {
            const reader = port.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        this.connected = false;
                        break;
                    }

                    var indexStart = this.findSequence(value, this.seqStart);

                    if (indexStart !== -1) {
                        indexStart += seqStart.length;
                        console.log(`Последовательность найдена с индекса: ${indexStart}`); // Вывод: Последовательность найдена с индекса: 2
                        const indexStop = this.findSequence(value, this.seqStop);
                        if (indexStop !== -1) {
                            console.log(`Последовательность stop с индекса: ${indexStop}`);
                            const slicedNumbers = value.slice(indexStart, indexStop); //
                            console.log(slicedNumbers);
                            // this.dispatchEvent(new CustomEvent('data-updated', { detail: this.data }));
                        }
                        else {
                            console.log("Последовательность stop не найдена");
                        }
                    }
                    else {
                        console.log("Последовательность не найдена");
                    }
                }
            } catch (error) {
                // Handle |error|...
                console.error("Error read serial port:", error);
            } finally {
                reader.releaseLock();
            }
        }
    }
    findSequence(arr, seq) {
        for (let i = 0; i <= arr.length - seq.length; i++) {
            let found = true;
            for (let j = 0; j < seq.length; j++) {
                if (arr[i + j] !== seq[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return i; // Возвращаем индекс начала последовательности
            }
        }
        return -1; // Последовательность не найдена
    }
    StartSimulation() {
        this.data.length = 0;
        this.data = [
            new RadarData(1, 45, 100, 1, 3, 200),
            new RadarData(2, -10, 100, 0, 5, 180)
        ];
        this.dispatchEvent(new CustomEvent('data-updated', { detail: this.data }));
        this.simulationHandle = setTimeout(() => {
            this.simulate();
        }, 1000);
    }
    simulate() {
        for (let i = 0; i < this.data.length; i++) {
            const radarData = this.data[i];

            if (radarData.SpeedDirection == 1) {
                if ((radarData.Distance - radarData.Speed) > 1) {
                    radarData.Distance = radarData.Distance - radarData.Speed;
                } else {
                    radarData.SpeedDirection = 0;

                }
            } else {
                if (radarData.Distance <= 150) {
                    radarData.Distance = radarData.Distance + radarData.Speed;
                } else {
                    radarData.SpeedDirection = 1;
                    radarData.Angle = getRandomInt(-45, 45);
                    radarData.Speed = getRandomInt(1, 10);
                    radarData.SignalToNoise = getRandomInt(100, 255);
                }
            }
        }
        this.dispatchEvent(new CustomEvent('data-updated', { detail: this.data }));
        this.simulationHandle = setTimeout(() => {
            this.simulate();
        }, 1000);
    }
    StopSimulation() {
        clearTimeout(this.simulationHandle);
    }
}

export class RadarData {
    constructor(id, angle, distance, speedDirection, speed, signalToNoise) {
        this.ID = id;
        this.Angle = angle;
        this.Distance = distance;
        this.SpeedDirection = speedDirection;
        this.Speed = speed;
        this.SignalToNoise = signalToNoise;
    }
}