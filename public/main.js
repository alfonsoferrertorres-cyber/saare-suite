document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sdk-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      // 1. Petición al endpoint serverless de generación de licencia
      const response = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al generar la licencia.');

      // 2. Descarga del archivo de licencia saare.lic
      const blob = await response.blob();
      const licUrl = window.URL.createObjectURL(blob);
      const linkLic = document.createElement('a');
      linkLic.href = licUrl;
      linkLic.download = 'saare.lic';
      document.body.appendChild(linkLic);
      linkLic.click();
      linkLic.remove();
      
      // Liberar memoria del objeto URL creado
      setTimeout(() => window.URL.revokeObjectURL(licUrl), 1000);

      // 3. Descarga del SDK Zip tras una pequeña pausa
      setTimeout(() => {
        const linkZip = document.createElement('a');
        linkZip.href = '/downloads/saare-sdk-v4.2.zip';
        linkZip.download = 'saare-sdk-v4.2.zip';
        document.body.appendChild(linkZip);
        linkZip.click();
        linkZip.remove();
      }, 500);

    } catch (error) {
      console.error('Error en el proceso de solicitud:', error);
      alert('Hubo un problema al procesar la solicitud.');
    }
  });
});
