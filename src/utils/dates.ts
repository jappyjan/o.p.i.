export function secondsToDayHourMinuteSeconds(seconds: number): string {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    let output = '';
    if (d > 0) {
        output += d + 'd ';
    }
    if (h > 0) {
        output += h + 'h ';
    }
    if (m > 0) {
        output += m + 'm ';
    }
    if (s > 0) {
        output += s + 's ';
    }

    return output.trim() || '0s';
}
