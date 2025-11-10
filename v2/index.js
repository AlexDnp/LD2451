import { RadarCanvas, Point } from './radarui/radarui.js';
import { Radar, RadarData } from './radar/radar.js';


document.addEventListener('alpine:init', () => {
    init();
});

function init() {
    const canvas = document.getElementById('canvas');
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight/2;
    const ctx = canvas.getContext('2d');

    const radarCanvas = new RadarCanvas(canvas, ctx);
    window.addEventListener('resize', () => {
        canvas.width = document.documentElement.clientWidth;
        radarCanvas.draw(); // Redraw radar when canvas size changes
    });

    radarCanvas.draw();

    const points = []

    const radar = new Radar();
    radar.addEventListener('data-updated', (e) => {
        points.length = 0;
        for (let i = 0; i < e.detail.length; i++) {
            const data = e.detail[i];
            const point = new Point(data.Angle, data.Distance);
            point.Text = data.ID;
            point.Speed = data.Speed;
            points.push(point);
        }
        radarCanvas.setPoints(points);
        Alpine.store('data', {
            points: points,
        });
    });

    radar.StartSimulation();

    Alpine.store('data', {
        points: points,
    });
}
