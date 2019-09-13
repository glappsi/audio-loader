export default function docReady(): Promise<any> {
  return new Promise(resolve => {
    // see if DOM is already available
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      // call on next available tick
      setTimeout(resolve, 1);
    } else {
      document.addEventListener('DOMContentLoaded', resolve);
    }
  });
}
