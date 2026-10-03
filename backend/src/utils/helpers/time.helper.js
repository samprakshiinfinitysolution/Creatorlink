// Converts time values like "15m", "7d", "2h"
// into milliseconds for cookie maxAge.

const getMilliseconds = (time) => {

    if (!time) {
        throw new Error("Time value is required");
    }

    const value = parseInt(time, 10);
    const unit = time.slice(-1);

    if (Number.isNaN(value)) {
        throw new Error(`Invalid time value: ${time}`);
    }

    const units = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    if (!units[unit]) {
        throw new Error(
            `Unsupported time unit: ${unit}`
        );
    }

    return value * units[unit];
};


export default getMilliseconds;