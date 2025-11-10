export class RadarCanvas {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.color = '#8ad7ccc7';
        this.mainColor = '#3ff78cfd';
        this.mainColorFill = 'rgba(63, 247, 140, 0.25)';
        this.scale = 1;
        this.points = [];
        this.radarDegrees = 90;
        this.maxDistance = 200;
    }

    draw() {
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        const radius = (this.canvas.height / 2 * this.scale) - 10;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas before drawing

        const sectorInRad = this.radarDegrees * Math.PI / 180;
        const startAngle = -Math.PI / 2 - sectorInRad / 2;
        const endAngle = -Math.PI / 2 + sectorInRad / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, radius, startAngle, endAngle);
        this.ctx.closePath();

        this.ctx.strokeStyle = this.mainColor;
        this.ctx.stroke();
        this.ctx.fillStyle = this.mainColorFill;
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(x, y, 2.5, 0, Math.PI * 2); // Draw a small circle for the dot
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();

        // Draw distance circles
        const innerRadiusStep = radius / 5;
        for (let i = 0; i < 5; i++) {
            const innerRadius = radius - innerRadiusStep * i;
            this.ctx.beginPath();
            this.ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = this.color;
            this.ctx.stroke();
            this.ctx.closePath();
        }

        const degree = 30;
        for (let i = 0; i < 360 / degree; i++) {
            const angle = (i * degree - 90) * Math.PI / 180;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            const destX = x + radius * Math.cos(angle);
            const destY = y + radius * Math.sin(angle);
            this.ctx.lineTo(destX, destY);
            this.ctx.strokeStyle = this.color;
            this.ctx.stroke();
            this.ctx.closePath();

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.translate(radius - 20, 0);
            this.ctx.rotate(-angle);
            this.ctx.fillStyle = this.color;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`${i * degree}°`, 0, 0);
            this.ctx.restore();
        }

        for (let i = 0; i < this.points.length; i++) {
            this.points[i].draw(this);
        }
    }

    setPoints(points) {
        this.points = points;
        this.draw();
    }

    translate(angle, distance) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        const angleRad = (angle - 90) * Math.PI / 180;

        if (distance > this.maxDistance) {
            distance = this.maxDistance + 5;
        }

        const radius = (this.canvas.height / 2 * this.scale) - 10;
        const localDistance = distance / this.maxDistance * radius;

        const radarX = localDistance * Math.cos(angleRad);
        const radarY = localDistance * Math.sin(angleRad);

        return [centerX + radarX, centerY + radarY];
    }

    getContext() {
        return this.ctx;
    }
}

export class Point {
    constructor(angle, distance) {
        this.Angle = angle;
        this.Distance = distance;
        this.Color = 'hsla(0, 100%, 50%, 1.00)';
        this.Text = '';
        this.Speed = 0;
    }

    draw(radarCanvas) {
        let ctx = radarCanvas.getContext()

        const coord = radarCanvas.translate(this.Angle, this.Distance);
        const x = coord[0];
        const y = coord[1];

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.Color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = this.Color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.Text, x, y + 10);
    }
}
