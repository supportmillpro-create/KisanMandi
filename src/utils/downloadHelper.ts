/**
 * Reliable client-side file downloader using Blob and ObjectURL.
 * Prevents iframe navigation/redirect errors on mobile and webview.
 */
export async function downloadSourceZip(filename = 'kisanmandi-full-source-code.zip'): Promise<boolean> {
  try {
    const response = await fetch('/kisanmandi-source-code.zip');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup URL after download initiates
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('Blob download failed, using fallback:', error);
    // Fallback direct link
    const link = document.createElement('a');
    link.href = '/kisanmandi-source-code.zip';
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return false;
  }
}
