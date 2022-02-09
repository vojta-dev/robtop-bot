export default function log(...message) {
  const prefix = new Date().toLocaleString('en-GB');

  console.log(`[${prefix}]`, ...message);
}
