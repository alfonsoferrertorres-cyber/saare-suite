document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sdk-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      // 1. Generar y descargar la licencia saare.lic desde la API serverless
      const response = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al generar la licencia');

      const blob = await response.blob();
      const licUrl = window.URL.createObjectURL(blob);
      const linkLic = document.createElement('a');
      linkLic.href = licUrl;
      linkLic.download = 'saare.lic';
      document.body.appendChild(linkLic);
      linkLic.click();
      linkLic.remove();

      // 2. Descargar el SDK Zip estático
      const linkZip = document.createElement('a');
      linkZip.href = '/downloads/saare-sdk-v4.2.zip';
      linkZip.download = 'saare-sdk-v4.2.zip';
      document.body.appendChild(linkZip);
      linkZip.click();
      linkZip.remove();

    } catch (error) {
      console.error('Error en el proceso de solicitud:', error);
      alert('Hubo un problema al procesar la solicitud.');
    }
  });
});