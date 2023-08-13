import { PNG } from 'pngjs';
import { createHash } from 'crypto';

const Fractal = {
	rectangle: (x, y, w, h, c, size, dst) => {
		for (let i = x; i < x + w; ++i) {
			for (let j = y; j < y + h; ++j) {
				const idx = (size * j + i) << 2;
				dst.data[idx] = c[0];
				dst.data[idx + 1] = c[1];
				dst.data[idx + 2] = c[2];
				dst.data[idx + 3] = c[3];
			}
		}
	},
	render: (hash, size, dst, fg, margin = 0.1) => {
		const bg = [255, 255, 255, 255];
		const baseMargin = Math.floor(size * margin);
		const cell = Math.floor((size - baseMargin * 2) / 5);
		margin = Math.floor((size - cell * 5) / 2);
		for (let i = 0; i < 15; ++i) {
			const color = parseInt(hash.charAt(i), 16) % 2 ? bg : fg;
			if (i < 5) {
				Fractal.rectangle(
					2 * cell + margin,
					i * cell + margin,
					cell,
					cell,
					color,
					size,
					dst
				);
			} else if (i < 10) {
				Fractal.rectangle(
					1 * cell + margin,
					(i - 5) * cell + margin,
					cell,
					cell,
					color,
					size,
					dst
				);
				Fractal.rectangle(
					3 * cell + margin,
					(i - 5) * cell + margin,
					cell,
					cell,
					color,
					size,
					dst
				);
			} else if (i < 15) {
				Fractal.rectangle(
					0 * cell + margin,
					(i - 10) * cell + margin,
					cell,
					cell,
					color,
					size,
					dst
				);
				Fractal.rectangle(
					4 * cell + margin,
					(i - 10) * cell + margin,
					cell,
					cell,
					color,
					size,
					dst
				);
			}
		}
	},
	generate: (str, size = 64, fg = [95, 82, 134, 255]) => {
		const dst = new PNG({ width: size, height: size });
		const hash = createHash('md5').update(str).digest('hex');
		dst.data.fill(255);
		Fractal.render(hash, size, dst, fg);
		return PNG.sync.write(dst);
	}
};

export default Fractal;
