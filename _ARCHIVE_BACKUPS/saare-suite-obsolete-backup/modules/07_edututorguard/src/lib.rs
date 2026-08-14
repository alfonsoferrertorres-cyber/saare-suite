pub struct EduTutorGuard;

impl EduTutorGuard {
    pub fn new() -> Self {
        Self
    }

    /// Filtra contenido inapropiado en entornos educativos
    pub fn check_content_safety(&self, content: &str) -> Result<(), &'static str> {
        if content.contains("inapropiado") {
            return Err("Bloqueo de seguridad: Contenido no apto para el entorno educativo.");
        }
        Ok(())
    }
}

impl Default for EduTutorGuard {
    fn default() -> Self {
        Self::new()
    }
}
