export const fetcher = (url: string) => fetch(url).then((r) => r.json());

// export const remToPx = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
export const remToPx = (rem: number) => rem * 16;
